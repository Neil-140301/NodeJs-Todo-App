const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format"); 

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return requestQuery.category !== undefined && requestQuery.status !== undefined;
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return requestQuery.category !== undefined && requestQuery.priority !== undefined;
};

const convertTodoDBObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date
  }
}

const validityInBody = (request,response,next) => {
  const {status='', category='', priority=''} = request.body

  let isStatusValid = true;
  if (
    !(
      status === "" ||
      status === "TO DO" ||
      status === "IN PROGRESS" ||
      status === "DONE"
    )
  ) {
    isStatusValid = false;
  }


  let isPriorityValid = true;
  if (
    !(
      priority === "" ||
      priority === "HIGH" ||
      priority === "MEDIUM" ||
      priority === "LOW"
    )
  ) {
    isPriorityValid = false;
  }


  let isCategoryValid = true;
  if (
    !(
      category === "" ||
      category === "WORK" ||
      category === "HOME" ||
      category === "LEARNING"
    )
  ) {
    isCategoryValid = false;
  }

  switch (false) {
    case isStatusValid:
      response.status(400);
      response.send("Invalid Todo Status");
      break;
    case isPriorityValid:
      response.status(400);
      response.send("Invalid Todo Priority");
      break;
    case isCategoryValid:
      response.status(400);
      response.send("Invalid Todo Category");
      break;
    default:
      next();
  }  
}

const validityInQuery = (request,response,next) => {
  const {status='', category='', priority=''} = request.query

  let isStatusValid = true;
  if (
    !(
      status === "" ||
      status === "TO DO" ||
      status === "IN PROGRESS" ||
      status === "DONE"
    )
  ) {
    isStatusValid = false;
  }


  let isPriorityValid = true;
  if (
    !(
      priority === "" ||
      priority === "HIGH" ||
      priority === "MEDIUM" ||
      priority === "LOW"
    )
  ) {
    isPriorityValid = false;
  }


  let isCategoryValid = true;
  if (
    !(
      category === "" ||
      category === "WORK" ||
      category === "HOME" ||
      category === "LEARNING"
    )
  ) {
    isCategoryValid = false;
  }

switch (false) {
    case isStatusValid:
      response.status(400);
      response.send("Invalid Todo Status");
      break;
    case isPriorityValid:
      response.status(400);
      response.send("Invalid Todo Priority");
      break;
    case isCategoryValid:
      response.status(400);
      response.send("Invalid Todo Category");
      break;
    default:
      next();
  }  
}

const validDateInBody = (request, response, next) => {
  const {dueDate} = request.body
  try {
    const formattedDate = format(new Date(dueDate),"yyyy-MM-dd");
    next()
  } catch (error) {
    response.status(400);
    response.send("Invalid Due Date");
  }
}

const validDateInQuery = (request, response, next) => {
  const {date} = request.query
  try {
    const formattedDate = format(new Date(date),"yyyy-MM-dd");
    next()
  } catch (error) {
    response.status(400);
    response.send("Invalid Due Date");
  }
}

app.get("/todos/", validityInQuery, async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category} = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND category = '${category}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      break;
  }

  data = await database.all(getTodosQuery);
  response.send(data.map(todo => (convertTodoDBObjectToResponseObject(todo))));
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(convertTodoDBObjectToResponseObject(todo));
});

app.get("/agenda/",validDateInQuery, async (request,response) => {
  let {date} = request.query;
  date = format(new Date(date),"yyyy-MM-dd");
  const getAgendaQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    due_date = '${date}'`;
  
  const agendaList = await database.all(getAgendaQuery);
  response.send(agendaList.map(todo => (
    convertTodoDBObjectToResponseObject(todo)
  )));
})

app.post("/todos/",validityInBody,validDateInBody, async (request, response) => {
  const { id, todo, priority, status, category, dueDate} = request.body;
  const formattedDate = format(new Date(dueDate),"yyyy-MM-dd");
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status, category, due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}', '${formattedDate}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/",validityInBody,validDateInBody, async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
