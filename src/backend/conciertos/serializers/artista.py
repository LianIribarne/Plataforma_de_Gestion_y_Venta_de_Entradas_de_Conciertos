from conciertos.models import Artista, Categoria, Pais
from rest_framework import serializers

from backend.utils.images import image_to_webp


# CATEGORIA
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

# PAIS
class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = ['id', 'nombre']

# ARTISTA
class ArtistaCreateSerializer(serializers.ModelSerializer):
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source="categoria",
        write_only=True
    )
    pais_origen_id = serializers.PrimaryKeyRelatedField(
        queryset=Pais.objects.all(),
        source="pais_origen",
        write_only=True
    )
    imagen = serializers.ImageField()

    class Meta:
        model = Artista
        fields = ['nombre', 'pais_origen_id', 'imagen', 'categoria_id']

    def validate_imagen(self, image):
        if image.content_type == 'image/webp':
            return image
        return image_to_webp(
            image,
            max_size=1024,
            quality=80
        )

class ArtistaSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    categoria = CategoriaSerializer()
    pais_origen = PaisSerializer()

    class Meta:
        model = Artista
        fields = ['id', 'nombre', 'imagen', 'categoria', 'pais_origen', 'activo']

    def get_imagen(self, obj):
        request = self.context.get("request")
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None

class ArtistaModificarSerializer(serializers.ModelSerializer):
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source="categoria",
        required=False
    )
    pais_origen_id = serializers.PrimaryKeyRelatedField(
        queryset=Pais.objects.all(),
        source="pais_origen",
        required=False
    )
    imagen = serializers.ImageField(required=False)

    class Meta:
        model = Artista
        fields = ['nombre', 'pais_origen_id', 'imagen', 'categoria_id', 'activo']

    def validate_imagen(self, image):
        if image.content_type == 'image/webp':
            return image
        return image_to_webp(
            image,
            max_size=1024,
            quality=80
        )

class ArtistaConciertoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer()
    pais_origen = PaisSerializer()

    class Meta:
        model = Artista
        fields = ['id', 'nombre', 'categoria', 'pais_origen']
