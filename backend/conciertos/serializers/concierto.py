from rest_framework import serializers
from django.db import transaction
from conciertos.models import ConciertoMeta, Concierto, Lugar, Artista, TipoEntrada
from entradas.models import Entrada
from conciertos.serializers.tipoEntrada import (
    TipoEntradaCreateSerializer, TipoEntradaMiniSerializer,
    TipoEntradaConciertoSerializer, TipoEntradaStatsSerializer,
    TipoEntradaReservasStatsSerializer
)
from conciertos.serializers.artista import ArtistaConciertoSerializer
from conciertos.serializers.lugar import LugarDetailSerializer
from django.utils import formats
from backend.utils.images import image_to_webp
from django.utils.translation import activate
activate("es")

# CONCIERTOMETA
class ConciertoMetaListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConciertoMeta
        fields = ["id", "tipo", "codigo", "nombre", "orden"]

# CONCIERTO
class ConciertoCreateSerializer(serializers.ModelSerializer):
    lugar_id = serializers.PrimaryKeyRelatedField(
        queryset=Lugar.objects.filter(activo=True),
        source="lugar",
        write_only=True,
        error_messages={
            "does_not_exist": "El lugar no existe o no está habilitado"
        }
    )
    artista_id = serializers.PrimaryKeyRelatedField(
        queryset=Artista.objects.filter(activo=True),
        source="artista",
        write_only=True,
        error_messages={
            "does_not_exist": "El artista no existe o no está habilitado"
        }
    )
    mood_id = serializers.PrimaryKeyRelatedField(
        queryset=ConciertoMeta.objects.filter(
            tipo="mood",
            activo=True
        ),
        source="mood",
        write_only=True
    )
    tipos_entrada = TipoEntradaCreateSerializer(
        many=True,
        write_only=True
    )
    organizador = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Concierto
        fields = [
            'titulo', 'descripcion', 'mood_id', 'fecha',
            'show_hora', 'puertas_hora', 'limite_reserva_total',
            'lugar_id', 'artista_id', 'organizador', 'tipos_entrada'
        ]
    
    def validate(self, data):
        tipos = data.get("tipos_entrada", [])

        if tipos:
            max_cantidad = max(t.get("limite_reserva", 0) for t in tipos)
            if data["limite_reserva_total"] < max_cantidad:
                raise serializers.ValidationError(
                    f"El límite de reserva total del concierto ({data['limite_reserva_total']}) "
                    f"no puede ser menor a la cantidad del tipo de entrada con más tickets ({max_cantidad})."
                )
            
            if len(tipos) > 4:
                raise serializers.ValidationError("Solo puede haber 4 tipos de entradas por concierto.")

        return data
    
    @transaction.atomic
    def create(self, validated_data):
        tipos_data = validated_data.pop("tipos_entrada")
        artista = validated_data.get("artista")
        validated_data["imagen"] = artista.imagen

        concierto = Concierto.objects.create(**validated_data)

        for tipo in tipos_data:
            tipo_entrada = TipoEntrada.objects.create(
                evento=concierto,
                nombre=tipo["nombre"],
                precio=tipo["precio"],
                cantidad_total=tipo["cantidad_total"],
                limite_reserva=tipo["limite_reserva"]
            )

            entradas = [
                Entrada(
                    tipo=tipo_entrada,
                    precio=tipo["precio"]
                )
                for _ in range(tipo["cantidad_total"])
            ]
            Entrada.objects.bulk_create(entradas)

        return concierto

class ConciertoListSerializer(serializers.ModelSerializer):
    artista = ArtistaConciertoSerializer()
    fecha = serializers.DateField(format="%d/%m/%Y")
    show_hora = serializers.TimeField(format="%H:%M")
    imagen = serializers.SerializerMethodField()
    tipos_entrada = TipoEntradaMiniSerializer(many=True)
    
    class Meta:
        model = Concierto
        fields = [
            'id', 'titulo', 'artista', 'fecha',
            'show_hora', 'imagen', 'tipos_entrada'
        ]
    
    def get_imagen(self, obj):
        request = self.context.get("request")
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None

class ConciertoUpdateSerializer(serializers.ModelSerializer):
    lugar_id = serializers.PrimaryKeyRelatedField(
        queryset=Lugar.objects.filter(activo=True),
        source="lugar",
        write_only=True,
        error_messages={
            "does_not_exist": "El lugar no existe o no está habilitado"
        }
    )
    artista_id = serializers.PrimaryKeyRelatedField(
        queryset=Artista.objects.filter(activo=True),
        source="artista",
        write_only=True,
        error_messages={
            "does_not_exist": "El artista no existe o no está habilitado"
        }
    )
    estado_id = serializers.PrimaryKeyRelatedField(
        queryset=ConciertoMeta.objects.filter(
            tipo="estado",
            activo=True
        ),
        source="estado",
        write_only=True
    )
    mood_id = serializers.PrimaryKeyRelatedField(
        queryset=ConciertoMeta.objects.filter(
            tipo="mood",
            activo=True
        ),
        source="mood",
        write_only=True
    )
    imagen = serializers.ImageField(required=False)

    class Meta:
        model = Concierto
        fields = [
            'titulo', 'descripcion', 'estado_id','mood_id', 'fecha',
            'show_hora', 'puertas_hora', 'limite_reserva_total',
            'lugar_id', 'artista_id', 'imagen'
        ]
    
    def validate_imagen(self, image):
        if image.content_type == 'image/webp':
            return image
        return image_to_webp(
            image,
            max_size=1024,
            quality=80
        )

class ConciertoDetailSerializer(serializers.ModelSerializer):
    estado = ConciertoMetaListSerializer()
    mood = ConciertoMetaListSerializer()
    lugar = LugarDetailSerializer()
    artista = ArtistaConciertoSerializer()
    fecha_legible = serializers.SerializerMethodField()
    show_hora_legible = serializers.TimeField(
        source='show_hora',
        format="%H:%M",
        read_only=True
    )
    puertas_hora_legible = serializers.TimeField(
        source='puertas_hora',
        format="%H:%M",
        read_only=True
    )
    tipos_entrada = TipoEntradaConciertoSerializer(many=True)

    class Meta:
        model = Concierto
        fields = [
            'titulo', 'descripcion', 'estado', 'mood', 'fecha',
            'show_hora', 'puertas_hora', 'limite_reserva_total',
            'imagen', 'lugar', 'artista', 'organizador', 'fecha_legible',
            'tipos_entrada', 'puertas_hora_legible', 'show_hora_legible'
        ]
    
    def get_fecha_legible(self, obj):
        fecha = formats.date_format(
            obj.fecha, "l d \\d\\e F"
        )
        palabras = fecha.split(" ")
        palabras[0] = palabras[0].capitalize()
        palabras[-1] = palabras[-1].capitalize()
        return " ".join(palabras)

class ConciertoStatsSerializer(serializers.ModelSerializer):
    entradas_totales = serializers.SerializerMethodField()
    entradas_disponibles = serializers.SerializerMethodField()
    entradas_reservadas = serializers.SerializerMethodField()
    entradas_vendidas = serializers.SerializerMethodField()

    cantidad_ventas = serializers.SerializerMethodField()

    ingreso_real = serializers.SerializerMethodField()
    ingreso_estimado = serializers.SerializerMethodField()

    ocupacion = serializers.SerializerMethodField()

    class Meta:
        model = Concierto
        fields = [
            "entradas_totales", "entradas_disponibles", "entradas_reservadas", "cantidad_ventas",
            "entradas_vendidas", "ingreso_real", "ingreso_estimado", "ocupacion",
        ]
    
    def _valor_o_sin_info(self, value):
        return "Sin información" if value in [0, None] else value
    
    def get_entradas_totales(self, obj):
        return self._valor_o_sin_info(obj.entradas_totales)
    
    def get_entradas_disponibles(self, obj):
        return self._valor_o_sin_info(obj.entradas_disponibles)
    
    def get_entradas_reservadas(self, obj):
        return self._valor_o_sin_info(obj.entradas_reservadas)
    
    def get_cantidad_ventas(self, obj):
        return self._valor_o_sin_info(obj.cantidad_ventas)
    
    def get_entradas_vendidas(self, obj):
        return self._valor_o_sin_info(obj.entradas_vendidas)
    
    def get_ingreso_real(self, obj):
        if obj.ingreso_real in [0, None]:
            return "Sin información"
        return f"${obj.ingreso_real:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    def get_ingreso_estimado(self, obj):
        if obj.ingreso_estimado in [0, None]:
            return "Sin información"
        return f"${obj.ingreso_estimado:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    def get_ocupacion(self, obj):
        if obj.ocupacion in [0, None]:
            return "Sin información"
        
        porcentaje = obj.ocupacion * 100
        porcentaje = round(porcentaje, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"

class ConciertoMiniSerializer(serializers.ModelSerializer):
    estado = ConciertoMetaListSerializer()
    mood = ConciertoMetaListSerializer()
    lugar = LugarDetailSerializer()
    artista = ArtistaConciertoSerializer()
    show_hora = serializers.TimeField(format="%H:%M")
    puertas_hora = serializers.TimeField(format="%H:%M")
    fecha = serializers.DateField(format="%d/%m/%Y")
    organizador = serializers.SerializerMethodField()

    class Meta:
        model = Concierto
        fields = [
            'titulo', 'estado', 'mood', 'fecha', 'lugar', 'artista',
            'show_hora', 'puertas_hora', 'limite_reserva_total', 'organizador'
        ]
    
    def get_organizador(self, obj):
        return {
            "nombre": obj.organizador.first_name,
            "apellido": obj.organizador.last_name,
            "email": obj.organizador.email,
        }

class ConciertoDashboardSerializer(serializers.Serializer):
    detalles = ConciertoMiniSerializer()
    concierto = ConciertoStatsSerializer()
    tipos_entrada = TipoEntradaStatsSerializer(many=True)
    tipos_reservas = TipoEntradaReservasStatsSerializer(many=True)
