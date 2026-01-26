import secrets

from conciertos.models import (Artista, Concierto, ConciertoMeta, Lugar,
                               TipoEntrada)
from conciertos.serializers.artista import ArtistaConciertoSerializer
from conciertos.serializers.lugar import LugarDetailSerializer
from conciertos.serializers.tipoEntrada import (TipoEntradaConciertoSerializer,
                                                TipoEntradaCreateSerializer,
                                                TipoEntradaMiniSerializer)
from django.db import transaction
from django.db.models import Max
from django.utils import formats, timezone
from django.utils.translation import activate
from entradas.models import Entrada
from rest_framework import serializers

from backend.utils.images import image_to_webp

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
                    f"no puede ser menor al limite de reserva del tipo ({max_cantidad})."
                )

            if len(tipos) > 4:
                raise serializers.ValidationError(
                    "Solo puede haber 4 tipos de entradas por concierto."
                )

        fecha = data.get("fecha")

        if fecha and fecha <= timezone.localdate():
            raise serializers.ValidationError("La fecha debe ser futura.")

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

            tokens = set()
            entradas = []

            for _ in range(tipo["cantidad_total"]):
                while True:
                    token = secrets.token_urlsafe(32)
                    if token not in tokens:
                        tokens.add(token)
                        break

                entradas.append(
                    Entrada(
                        tipo=tipo_entrada,
                        precio=tipo["precio"],
                        qr_token=token
                    )
                )

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
            'show_hora', 'imagen', 'tipos_entrada',
            'estado'
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

    def validate_fecha(self, fecha):
        if fecha <= timezone.localdate():
            raise serializers.ValidationError("La fecha debe ser futura.")
        return fecha

    def validate_limite_reserva_total(self, limite):
        concierto = self.instance

        if concierto is None:
            return limite

        max_cantidad = concierto.tipos_entrada.filter(
            activo=True
        ).aggregate(
            maximo=Max("limite_reserva")
        )["maximo"]

        if max_cantidad and limite < max_cantidad:
            raise serializers.ValidationError(
                f"El límite de reserva total del concierto ({limite}) "
                f"no puede ser menor al limite de reserva del tipo ({max_cantidad})."
            )

        return limite

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
