import json
import secrets

from celery import current_app
from conciertos.models import (Artista, Concierto, ConciertoMeta, Lugar,
                               TipoEntrada)
from conciertos.serializers.artista import ArtistaConciertoSerializer
from conciertos.serializers.lugar import LugarDetailSerializer
from conciertos.serializers.tipoEntrada import (TipoEntradaConciertoSerializer,
                                                TipoEntradaCreateSerializer,
                                                TipoEntradaMiniSerializer)
from conciertos.tasks import finalizar_concierto, iniciar_concierto
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
    tipos_entrada = serializers.CharField(
        write_only=True,
        required=False
    )
    imagen = serializers.ImageField(required=False)
    organizador = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Concierto
        fields = [
            'titulo', 'descripcion', 'mood_id', 'fecha', 'duracion',
            'show_hora', 'puertas_hora', 'limite_reserva_total', 'imagen',
            'lugar_id', 'artista_id', 'organizador', 'tipos_entrada'
        ]

    def validate(self, data):
        raw_tipos = self.initial_data.get("tipos_entrada")

        if not raw_tipos:
            raise serializers.ValidationError({
                "tipos_entrada": "Este campo es requerido."
            })

        try:
            tipos = json.loads(raw_tipos)
        except json.JSONDecodeError:
            raise serializers.ValidationError({
                "tipos_entrada": "Debe ser un JSON válido."
            })

        if not isinstance(tipos, list):
            raise serializers.ValidationError({
                "tipos_entrada": "Debe ser una lista."
            })

        if len(tipos) > 4:
            raise serializers.ValidationError({
                "tipos_entrada": "Solo puede haber como maximo 4 tipos de entradas."
            })

        nombres = [t.get("nombre").strip().lower() for t in tipos]

        if any(not n for n in nombres):
            raise serializers.ValidationError({
                "tipos_entrada": "Cada tipo de entrada debe tener un nombre."
            })

        if len(nombres) != len(set(nombres)):
            raise serializers.ValidationError({
                "tipos_entrada": "No se pueden repetir los nombres de los tipos de entrada."
            })

        serializer = TipoEntradaCreateSerializer(data=tipos, many=True)
        serializer.is_valid(raise_exception=True)

        data["tipos_entrada"] = serializer.validated_data

        max_cantidad = max(t["limite_reserva"] for t in data["tipos_entrada"])
        if data["limite_reserva_total"] < max_cantidad:
            raise serializers.ValidationError(
                f"El límite de reserva total del concierto ({data['limite_reserva_total']}) "
                f"no puede ser menor al limite de reserva del tipo ({max_cantidad})."
            )

        fecha = data.get("fecha")

        if fecha and fecha <= timezone.localdate():
            raise serializers.ValidationError("La fecha debe ser futura.")

        return data

    @transaction.atomic
    def create(self, validated_data):
        tipos_data = validated_data.pop("tipos_entrada")
        imagen = validated_data.pop("imagen", None)

        if not imagen:
            artista = validated_data.get("artista")
            imagen = artista.imagen


        concierto = Concierto.objects.create(
            imagen=imagen,
            **validated_data
        )

        inicio_task = iniciar_concierto.apply_async(
            args=[concierto.id],
            eta=concierto.fecha_inicio
        )

        fin_task = finalizar_concierto.apply_async(
            args=[concierto.id],
            eta=concierto.fecha_fin
        )

        concierto.iniciar_task_id = inicio_task.id
        concierto.finalizar_task_id = fin_task.id
        concierto.save(update_fields=[
            "iniciar_task_id",
            "finalizar_task_id"
        ])

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
    estado = ConciertoMetaListSerializer()
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
            'lugar_id', 'artista_id', 'imagen', 'duracion'
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

    def update(self, instance, validated_data):
        old_inicio = instance.fecha_inicio
        old_fin = instance.fecha_fin

        instance = super().update(instance, validated_data)

        new_inicio = instance.fecha_inicio
        new_fin = instance.fecha_fin

        if old_inicio != new_inicio or old_fin != new_fin:
            if instance.iniciar_task_id:
                current_app.control.revoke(instance.iniciar_task_id)

            if instance.finalizar_task_id:
                current_app.control.revoke(instance.finalizar_task_id)

            inicio_task = iniciar_concierto.apply_async(
                args=[instance.id],
                eta=new_inicio
            )

            fin_task = finalizar_concierto.apply_async(
                args=[instance.id],
                eta=new_fin
            )

            instance.iniciar_task_id = inicio_task.id
            instance.finalizar_task_id = fin_task.id
            instance.save(update_fields=[
                "iniciar_task_id",
                "finalizar_task_id"
            ])

        return instance

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
            'tipos_entrada', 'puertas_hora_legible', 'show_hora_legible',
            'duracion'
        ]

    def get_fecha_legible(self, obj):
        fecha = formats.date_format(
            obj.fecha, "l d \\d\\e F"
        )
        palabras = fecha.split(" ")
        palabras[0] = palabras[0].capitalize()
        palabras[-1] = palabras[-1].capitalize()
        return " ".join(palabras)
