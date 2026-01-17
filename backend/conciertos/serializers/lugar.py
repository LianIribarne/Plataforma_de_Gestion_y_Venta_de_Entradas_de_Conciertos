from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from conciertos.models import Provincia, Ciudad, Lugar

# PROVINCIA
class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = ['id', 'nombre']

# CIUDAD
class CiudadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ciudad
        fields = ['id', 'nombre']

# LUGAR
class LugarCreateSerializer(serializers.ModelSerializer):
    ciudad_id = serializers.PrimaryKeyRelatedField(
        queryset=Ciudad.objects.all(),
        source="ciudad",
        write_only=True
    )

    class Meta:
        model = Lugar
        fields = ['nombre', 'direccion', 'ciudad_id']
        validators = [
            UniqueTogetherValidator(
                queryset=Lugar.objects.all(),
                fields=["nombre", "ciudad_id"],
                message="Ya existe un lugar con ese nombre en esa ciudad."
            )
        ]

class LugarSerializer(serializers.ModelSerializer):
    provincia = serializers.SerializerMethodField()

    class Meta:
        model = Lugar
        fields = ['id', 'nombre', 'direccion', 'provincia', 'activo']
    
    def get_provincia(self, obj):
        ciudad = obj.ciudad
        provincia = ciudad.provincia

        return {
            'id': provincia.id,
            'nombre': provincia.nombre,
            'ciudad': {
                'id': ciudad.id,
                'nombre': ciudad.nombre
            }
        }

class LugarModificarSerializer(serializers.ModelSerializer):
    ciudad_id = serializers.PrimaryKeyRelatedField(
        queryset=Ciudad.objects.all(),
        source="ciudad",
        required=False
    )

    class Meta:
        model = Lugar
        fields = ['nombre', 'direccion', 'ciudad_id', 'activo']
        validators = [
            UniqueTogetherValidator(
                queryset=Lugar.objects.all(),
                fields=["nombre", "ciudad_id"],
                message="Ya existe un lugar con ese nombre en esa ciudad."
            )
        ]

class LugarDetailSerializer(serializers.ModelSerializer):
    provincia = serializers.SerializerMethodField()

    class Meta:
        model = Lugar
        fields = ['id', 'nombre', 'direccion', 'provincia', 'activo']
    
    def get_provincia(self, obj):
        ciudad = obj.ciudad
        provincia = ciudad.provincia

        return {
            'id': provincia.id,
            'nombre': provincia.nombre,
            'ciudad': {
                'id': ciudad.id,
                'nombre': ciudad.nombre
            }
        }
