<!-- eliminar -->

docker compose down -v --rmi all --remove-orphans

<!-- crear -->

docker compose up --build
docker compose --profile init up backend_init
