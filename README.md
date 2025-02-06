
# Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar
```
npm install
```
3. Levantar la base de datos
```
docker compose up -d
``` 

4. Clonar el archivo ```.env.template``` y renombrar la copia a ```.env```

5. Llenar las variables de entorno definidas en el ```.env```

6. Ejecutar la aplicación en dev:
```
npm start
```

7. Reconstruir la base de datos con la semilla
```
http://localhost:3000/api/v2/seed
```


## Stack usado
* MongoDB
* Node


# Production Build
1. Crear el archivo ```.env.prod```
2. Llenar las varaibles de entorno de prod
3. Crear la nueva imagen
```
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build
```