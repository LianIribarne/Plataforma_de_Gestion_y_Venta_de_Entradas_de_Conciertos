from rest_framework import serializers
from django.db import transaction
from conciertos.models import TipoEntrada
from .models import Entrada, Reserva
from .tasks import expirar_reserva

class ItemReservaSerializer(serializers.Serializer):
    tipo = serializers.PrimaryKeyRelatedField(
        queryset=TipoEntrada.objects.filter(activo=True)
    )
    cantidad = serializers.IntegerField(min_value=1)

class ReservaCreateSerializer(serializers.ModelSerializer):
    items = ItemReservaSerializer(
        many=True,
        allow_empty=False,
        write_only=True
    )

    class Meta:
        model = Reserva
        fields = ['items']

    def validate_items(self, value):
        if len(value) > 4:
            raise serializers.ValidationError("Máximo 4 tipos de entrada.")
        
        tipos = [item["tipo"] for item in value]
        if len(tipos) != len(set(tipos)):
            raise serializers.ValidationError("No se puede repetir el mismo tipo.")
        
        estado = value[0]["tipo"].evento.estado.nombre
        if estado != 'Programado':
            raise serializers.ValidationError(f"No se puede reservar en este concierto porque esta {estado}")
    
        return value
    
    def validate(self, attrs):
        user = self.context["request"].user

        if Reserva.objects.filter(cliente=user, activo=True).exists():
            raise serializers.ValidationError(
                "Ya tenés una reserva activa."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        items = validated_data["items"]

        with transaction.atomic():
            concierto = items[0]["tipo"].evento

            total_solicitado = sum(item["cantidad"] for item in items)
            if total_solicitado > concierto.limite_reserva_total:
                raise serializers.ValidationError(
                    f"No podés reservar más de {concierto.limite_reserva_total} entradas en total para este concierto."
                )
            
            reserva = Reserva.objects.create(
                cliente=request.user,
                concierto=concierto
            )

            for item in items:
                tipo = item["tipo"]
                cantidad = item["cantidad"]

                if tipo.limite_reserva < cantidad:
                    raise serializers.ValidationError(
                        f"Se supera el limite de reserva aceptado, {tipo.nombre}({tipo.limite_reserva})."
                    )
                
                if tipo.evento != concierto:
                    raise serializers.ValidationError(
                        "No se pueden reservar entradas de distintos conciertos en una misma reserva."
                    )

                disponibles = (
                    Entrada.objects
                    .select_for_update()
                    .filter(
                        tipo=tipo,
                        estado="disponible",
                        reserva__isnull=True
                    )[:cantidad]
                )

                if len(disponibles) < cantidad:
                    raise serializers.ValidationError(
                        f"No hay suficientes entradas para el tipo {tipo.nombre}"
                    )

                for entrada in disponibles:
                    entrada.estado = "reservada"
                    entrada.reserva = reserva
                    entrada.save()

            # agendar expiración
            result = expirar_reserva.apply_async(
                args=[reserva.id],
                eta=reserva.reservar_hasta
            )
            reserva.task_id = result.id
            reserva.save()

        return reserva

class ReservaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['id', 'reservar_hasta']
