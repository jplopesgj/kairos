# Kairos

Controle local de horas trabalhadas para freelancers.

## Padronização do frontend

O frontend utiliza ESLint para manter o código consistente entre colaboradores:

```bash
cd frontend
npm run lint       # verifica problemas
npm run lint:fix   # corrige problemas automaticamente quando possível
```

## Executar com Docker

```bash
docker compose up --build
```

Depois, abra <http://localhost:5173>. A API fica disponível em <http://localhost:8000>.

O primeiro `migrate --seed` cria um cliente e um projeto de exemplo. Os dados ficam no volume `postgres_data`.

## Executar sem Docker

Requer PHP 8.2+, Composer, PostgreSQL, Node 18+ e npm.

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# em outro terminal
cd frontend
npm install
npm run dev
```

## Funcionalidades do MVP

- Timer único com encerramento no mesmo dia.
- Lançamentos manuais com data, início, fim e descrição.
- Clientes, projetos e valor/hora por projeto.
- Resumos por hoje, últimos 7 dias e mês atual.
- Exportação CSV compatível com Excel.
