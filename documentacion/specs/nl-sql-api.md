# API NL-SQL - Consultas en Lenguaje Natural

## 📋 Descripción

API para convertir preguntas en lenguaje natural a consultas SQL y ejecutarlas en MySQL HeatWave.

Utiliza la función nativa de MySQL HeatWave `sys.NL_SQL` con el modelo **meta.llama-3.3-70b-instruct** para generar consultas SQL automáticamente.

---

## 🚀 Endpoints

### 1. Ejecutar Consulta NL-SQL

**Endpoint:** `POST /api/v1/nl_sql`

Convierte una pregunta en lenguaje natural a SQL y ejecuta la consulta.

#### Request

```json
{
  "question": "Dame información de los créditos vigentes o vencidos de clientes llamados Karla Reyes"
}
```

**Validaciones:**
- `question` es requerido
- Mínimo 10 caracteres
- Máximo 1000 caracteres

#### Response Exitosa (200)

```json
{
  "question": "Dame información de los créditos vigentes o vencidos de clientes llamados Karla Reyes",
  "generatedSQL": "SELECT `T1`.`MontoCredito`, `T1`.`SaldoCapVigent`, `T1`.`SaldoCapAtrasad`, `T1`.`SaldoCapVencido`, `T1`.`Estatus` FROM `microfinMexico`.`CREDITOS` AS `T1` JOIN `microfinMexico`.`CLIENTES` AS `T2` ON `T1`.`ClienteID` = `T2`.`ClienteID` WHERE `T2`.`NombreCompleto` LIKE '%Karla Reyes%' AND `T1`.`Estatus` IN ('V', 'B')",
  "results": [
    {
      "MontoCredito": 100000.00,
      "SaldoCapVigent": 0.00,
      "SaldoCapAtrasad": 0.00,
      "SaldoCapVencido": 45901.23,
      "Estatus": "B"
    },
    {
      "MontoCredito": 43000.00,
      "SaldoCapVigent": 0.00,
      "SaldoCapAtrasad": 0.00,
      "SaldoCapVencido": 10750.03,
      "Estatus": "B"
    }
  ],
  "metadata": {
    "rowCount": 2,
    "executionTime": "245ms",
    "tablesUsed": [
      "microfinMexico.CREDITOS",
      "microfinMexico.CLIENTES"
    ],
    "modelId": "meta.llama-3.3-70b-instruct",
    "isValid": true,
    "schemas": [
      "microfinMexico"
    ]
  }
}
```

#### Response de Error (400)

```json
{
  "error": "Validación fallida",
  "message": "La pregunta debe tener al menos 10 caracteres para ser válida"
}
```

#### Response de Error (500)

```json
{
  "error": "Error interno del servidor",
  "message": "No se pudo generar una consulta SQL válida. Intenta reformular tu pregunta."
}
```

---

### 2. Información del Servicio

**Endpoint:** `GET /api/v1/nl_sql/info`

Obtiene información sobre el servicio NL-SQL.

#### Response (200)

```json
{
  "service": "MySQL HeatWave NL-SQL",
  "description": "Convierte preguntas en lenguaje natural a consultas SQL y las ejecuta",
  "version": "1.0.0",
  "model": "meta.llama-3.3-70b-instruct",
  "defaultSchema": "microfinMexico",
  "defaultTables": [
    "CLIENTES",
    "CREDITOS"
  ],
  "maxResults": 1000,
  "timeout": "120 segundos",
  "usage": {
    "endpoint": "POST /api/v1/nl_sql",
    "requestBody": {
      "question": "Tu pregunta en lenguaje natural"
    },
    "example": {
      "question": "Dame información de los créditos vigentes o vencidos de clientes llamados Karla Reyes"
    }
  }
}
```

---

## 📊 Configuración

### Variables de Entorno

Las mismas variables de MySQL ya configuradas:

```env
MYSQL_HOST=tu_host
MYSQL_PORT=3306
MYSQL_DATABASE=microfinMexico
MYSQL_USER=tu_usuario
MYSQL_PASSWORD=tu_password
```

### Tablas Disponibles por Default

- **Schema**: `microfinMexico`
- **Tablas**:
  - `CLIENTES`
  - `CREDITOS`

Más tablas pueden agregarse manualmente en `HeatwaveService`.

---

## 🧪 Ejemplos de Uso

### Con curl

```bash
# 1. Consulta básica
curl -X POST http://localhost:3000/api/v1/nl_sql \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "Dame información de los créditos vigentes"
  }'

# 2. Consulta con filtros
curl -X POST http://localhost:3000/api/v1/nl_sql \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "Dame los clientes con créditos mayores a 50000 pesos"
  }'

# 3. Consulta con joins implícitos
curl -X POST http://localhost:3000/api/v1/nl_sql \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "Muéstrame el nombre de los clientes y sus montos de crédito vencidos"
  }'

# 4. Información del servicio
curl http://localhost:3000/api/v1/nl_sql/info
```

### Con JavaScript/Fetch

```javascript
// Función para ejecutar consulta NL-SQL
async function executeNLQuery(question) {
  const response = await fetch('http://localhost:3000/api/v1/nl_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error en la consulta')
  }

  return await response.json()
}

// Uso
try {
  const result = await executeNLQuery(
    'Dame información de créditos vigentes'
  )
  
  console.log('SQL Generado:', result.generatedSQL)
  console.log('Resultados:', result.results)
  console.log('Filas:', result.metadata.rowCount)
  console.log('Tiempo:', result.metadata.executionTime)
} catch (error) {
  console.error('Error:', error.message)
}
```

### Con Python

```python
import requests

def execute_nl_query(question):
    url = "http://localhost:3000/api/v1/nl_sql"
    payload = {"question": question}
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.json().get('message')}")

# Uso
try:
    result = execute_nl_query("Dame los créditos vencidos")
    
    print(f"SQL: {result['generatedSQL']}")
    print(f"Resultados: {len(result['results'])} filas")
    print(f"Tiempo: {result['metadata']['executionTime']}")
    
    for row in result['results']:
        print(row)
        
except Exception as e:
    print(f"Error: {e}")
```

---

## 💡 Ejemplos de Preguntas

### Consultas Básicas

```
"Dame todos los clientes"
"Muestra los créditos vigentes"
"Cuántos clientes hay en la base de datos"
```

### Consultas con Filtros

```
"Dame los clientes cuyo nombre contiene Maria"
"Muestra los créditos con monto mayor a 100000"
"Dame los créditos vencidos"
```

### Consultas con Joins

```
"Muestra el nombre de los clientes y sus montos de crédito"
"Dame información de créditos y sus clientes"
"Cuáles clientes tienen créditos vigentes"
```

### Consultas con Agregaciones

```
"Suma total de créditos por cliente"
"Promedio de montos de crédito"
"Cuenta cuántos créditos tiene cada cliente"
```

### Consultas Complejas

```
"Dame información de los créditos vigentes o vencidos (monto crédito, saldos de capital vigente, atrasado y vencido) de los clientes que su nombre es parecido a Karla Reyes"

"Muestra los clientes con créditos vencidos que tengan saldo mayor a 10000"

"Dame el top 10 de clientes con mayor deuda vencida"
```

---

## ⚙️ Características Técnicas

### Límites y Configuración

- **Máximo de resultados**: 1000 registros
- **Timeout**: 120 segundos (2 minutos)
- **Longitud de pregunta**: 10 - 1000 caracteres
- **Modelo**: meta.llama-3.3-70b-instruct

### Proceso Interno

1. **Validación** del request body
2. **Llamada a sys.NL_SQL** con la pregunta y configuración
3. **Parseo del output** JSON de HeatWave
4. **Validación del SQL** generado
5. **Ejecución** del SQL en MySQL
6. **Aplicación de límites** (1000 registros max)
7. **Retorno de resultados** con metadata

### Arquitectura

```
Presentation Layer (Controller)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
HeatwaveService
    ↓
MySQLDatabase (Pool de conexiones)
    ↓
MySQL HeatWave (sys.NL_SQL)
```

---

## 🔧 Agregar Más Tablas

Para agregar más tablas al análisis de NL-SQL, edita `HeatwaveService`:

```typescript
// src/infrastructure/services/heatwave.service.ts

private readonly defaultTables = [
  { schema_name: 'microfinMexico', table_name: 'CLIENTES' },
  { schema_name: 'microfinMexico', table_name: 'CREDITOS' },
  { schema_name: 'microfinMexico', table_name: 'PAGOS' },        // ✅ Nueva
  { schema_name: 'microfinMexico', table_name: 'TRANSACCIONES' } // ✅ Nueva
]
```

---

## ⚠️ Manejo de Errores

### Errores Comunes

#### 1. Pregunta mal formulada

```json
{
  "error": "Error interno del servidor",
  "message": "No se pudo generar una consulta SQL válida. Intenta reformular tu pregunta."
}
```

**Solución**: Reformula la pregunta de manera más clara o específica.

#### 2. Función NL_SQL no disponible

```json
{
  "error": "Error interno del servidor",
  "message": "La función NL_SQL no está disponible. Verifica que MySQL HeatWave esté configurado correctamente."
}
```

**Solución**: Verifica que MySQL HeatWave esté instalado y configurado.

#### 3. Error de conexión MySQL

```json
{
  "error": "Error interno del servidor",
  "message": "MySQL pool not initialized. Call connect() first."
}
```

**Solución**: Verifica que las variables de entorno de MySQL estén configuradas y el servicio esté iniciado.

---

## 📈 Monitoreo y Logs

El servicio genera logs detallados:

```
🔥 HeatWave: Ejecutando consulta NL-SQL
📝 Pregunta: Dame información de los créditos vigentes
📊 Output de NL_SQL: {...}
🚀 Ejecutando SQL generado: SELECT ...
📊 Resultados obtenidos: 15 filas
✅ Consulta completada: 15 resultados en 245ms
⏱️  Tiempo de ejecución: 245ms
```

---

## 🚀 Deployment

### Railway

Las mismas variables de MySQL ya configuradas son suficientes.

### Testing

```bash
# Health check de MySQL
curl http://localhost:3000/api/health/mysql

# Info del servicio NL-SQL
curl http://localhost:3000/api/v1/nl_sql/info

# Prueba de consulta
curl -X POST http://localhost:3000/api/v1/nl_sql \
  -H 'Content-Type: application/json' \
  -d '{"question": "Dame todos los clientes"}'
```

---

## 📚 Referencias

- [MySQL HeatWave NL_SQL Documentation](https://dev.mysql.com/doc/heatwave/en/)
- [Meta Llama 3.3 70B Model](https://www.llama.com/)

---

## 🔐 Seguridad (Futuras Mejoras)

Actualmente sin autenticación. Para producción considera:

- ✅ Agregar autenticación JWT
- ✅ Rate limiting por usuario
- ✅ Validación de queries (solo SELECT)
- ✅ Audit logs de consultas
- ✅ Whitelist de tablas permitidas por usuario

