# Nuxt 3 Project Setup (Node JS)

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Local Development Server

If you are on Windows, please use WSL2 Ubuntu, as currently Nuxt has some bugs on Windows

Install node version v18.16

Install the dependencies

```bash
# npm
npm install
```

Start the development server on `http://localhost:3000`
```bash
npm run dev --project=PROJECT_NAME --env=ENV_NAME
```

e.g.
```bash
npm run dev --project=yeebet --env=dev
```

----------------------------------------------------------

## Stage or Production Deployment (Docker)

Prerequisite

```bash
#Install
Docker
Docker Compose
```

Create Working Directory On Server

```bash
#follow docker-compose file
mkdir app
```

Clone git repo

```bash
#staging (using staging branch)
git clone -b staging https://{{username}}:{{token}}@github.com/gherotech/{{repo_name}}.git

#production (using main branch)
git clone https://{{username}}:{{token}}@github.com/gherotech/{{repo_name}}.git
```

Execute docker compose

```bash
#Go to path
cd /app/{{repo_name}}/{{web/admin}}

#staging 
docker compose -f {{docker_project_folder_name}}/docker-compose.stage.yml up -d

#production 
docker compose -f {{docker_project_folder_name}}/docker-compose.prod.yml up -d

#check container logs
docker logs -f {{container_name}}


Look at the [Docker documentation](https://docs.docker.com/engine/reference/commandline/docker/) to learn more.
```

----------------------------------------------------------

## Production Deployment Note

Got added container replica number on docker-compose.prod.yml, this will multiple two same container and need handle traffic using nginx.

```bash
#production (port range and replicas number)
ports:
      - "3000-3001:3000"
...
deploy:
      mode: replicated
      replicas: 2  
```

Sample NGINX conf

```bash
upstream web {
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    server container_replica_1:3000;
    server container_replica_1:3000;
}

server {
    listen 80;
    server_name local.gateway.com;

    location / {
        proxy_pass http://web;
    }
}
```

## Production Jenkin Flow

```bash
cd /app/{{repo_name}}/{{web/admin}}
git stash (prevent file conflict)
git pull
docker restart {{container_name_1}}
#execute after container_name_1 up and running
docker restart {{container_name_2}}
```
     

----------------------------------------------------------


## Recommendations:

### Use VS Code extensions:

1. Vue Language Features (Volar)
2. Tailwind CSS IntelliSense