from rest_framework import serializers
from conciertos.models import TipoEntrada

class TipoEntradaCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2)
    cantidad_total = serializers.IntegerField(min_value=1)
    limite_reserva = serializers.IntegerField(min_value=1)

class TipoEntradaStatsSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    vendidas = serializers.SerializerMethodField()
    canceladas = serializers.SerializerMethodField()
    precio = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = [
            "id", "nombre", "precio", "cantidad_total",
            "disponibles", "vendidas", "canceladas", "limite_reserva",
        ]
    
    def _valor_o_sin_info(self, value):
        return "Sin información" if value in [0, None] else value
    
    def get_disponibles(self, obj):
        return self._valor_o_sin_info(obj.disponibles)
    
    def get_vendidas(self, obj):
        return self._valor_o_sin_info(obj.vendidas)
    
    def get_canceladas(self, obj):
        return self._valor_o_sin_info(obj.canceladas)
    
    def get_precio(self, obj):
        return f"${obj.precio:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

class TipoEntradaReservasStatsSerializer(serializers.ModelSerializer):
    reservas_totales = serializers.SerializerMethodField()
    reservas_activas = serializers.SerializerMethodField()
    reservas_expiradas = serializers.SerializerMethodField()
    reservas_finalizadas = serializers.SerializerMethodField()

    reservas_activas_pct = serializers.SerializerMethodField()
    reservas_expiradas_pct = serializers.SerializerMethodField()
    reservas_finalizadas_pct = serializers.SerializerMethodField()

    ratio_reserva_compra = serializers.SerializerMethodField()

    ingreso_real = serializers.SerializerMethodField()
    ingreso_estimado = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = [
            "id", "nombre",

            # reservas
            "reservas_totales", "reservas_activas", "reservas_expiradas", "reservas_finalizadas",

            # porcentajes
            "reservas_activas_pct", "reservas_expiradas_pct", "reservas_finalizadas_pct",

            # ratio
            "ratio_reserva_compra",

            # dinero
            "ingreso_real", "ingreso_estimado",
        ]
    
    def _valor_o_sin_info(self, value):
        return "Sin información" if value in [0, None] else value
    
    def get_reservas_totales(self, obj):
        return self._valor_o_sin_info(obj.reservas_totales)
    
    def get_reservas_activas(self, obj):
        return self._valor_o_sin_info(obj.reservas_activas)
    
    def get_reservas_expiradas(self, obj):
        return self._valor_o_sin_info(obj.reservas_expiradas)
    
    def get_reservas_finalizadas(self, obj):
        return self._valor_o_sin_info(obj.reservas_finalizadas)
    
    def get_reservas_activas_pct(self, obj):
        if obj.reservas_activas_pct in [0, None]:
            return "Sin información"
        
        porcentaje = obj.reservas_activas_pct * 100
        porcentaje = round(porcentaje, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"
    
    def get_reservas_expiradas_pct(self, obj):
        if obj.reservas_expiradas_pct in [0, None]:
            return "Sin información"
        
        porcentaje = obj.reservas_expiradas_pct * 100
        porcentaje = round(porcentaje, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"
    
    def get_reservas_finalizadas_pct(self, obj):
        if obj.reservas_finalizadas_pct in [0, None]:
            return "Sin información"
        
        porcentaje = obj.reservas_finalizadas_pct * 100
        porcentaje = round(porcentaje, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"
    
    def get_ratio_reserva_compra(self, obj):
        if obj.ratio_reserva_compra in [0, None]:
            return "Sin información"
        
        porcentaje = obj.ratio_reserva_compra * 100
        porcentaje = round(porcentaje, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"
    
    def get_ingreso_real(self, obj):
        if obj.ingreso_real in [0, None]:
            return "Sin información"
        return f"${obj.ingreso_real:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    def get_ingreso_estimado(self, obj):
        if obj.ingreso_estimado in [0, None]:
            return "Sin información"
        return f"${obj.ingreso_estimado:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

class TipoEntradaConciertoSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    reservadas = serializers.SerializerMethodField()
    precio_legible = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = [
            "nombre",
            "precio",
            "precio_legible",
            "cantidad_total",
            "limite_reserva",
            "disponibles",
            "reservadas",
        ]

    def get_disponibles(self, obj):
        return obj.entradas.filter(estado="disponible").count()

    def get_reservadas(self, obj):
        return obj.entradas.filter(estado="reservada").count()
    
    def get_precio_legible(self, obj):
        return f"${obj.precio:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

class TipoEntadaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = ['nombre', 'precio', 'limite_reserva', 'activo']

class TipoEntradaMiniSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    vendidas = serializers.SerializerMethodField()
    reservadas = serializers.SerializerMethodField()
    canceladas = serializers.SerializerMethodField()
    
    class Meta:
        model = TipoEntrada
        fields = [
            'id', 'nombre', 'precio', 'limite_reserva', 'activo',
            'disponibles', 'vendidas', 'reservadas', 'canceladas'
        ]
    
    def get_disponibles(self, obj):
        return obj.entradas.filter(estado="disponible").count()
    
    def get_vendidas(self, obj):
        return obj.entradas.filter(estado="vendida").count()

    def get_reservadas(self, obj):
        return obj.entradas.filter(estado="reservada").count()
    
    def get_canceladas(self, obj):
        return obj.entradas.filter(estado="cancelada").count()

class TipoEntradaCancelarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = []

class TipoEntradaCancelarCantidadSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(min_value=1)

    class Meta:
        model = TipoEntrada
        fields = ["cantidad"]

class TipoEntradaModificarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = ["precio", "nombre", "limite_reserva"]

class TipoEntradaAgregarSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(
        min_value=1,
        required=False
    )

    class Meta:
        model = TipoEntrada
        fields = ["cantidad"]
