const AWS = require('../config/aws-config');  // Adjust path as necessary
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.getTodos = (req, res) => {
    const params = {
        TableName: 'dev-todos',
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Cannot fetch data from DynamoDB'});
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.status(200).json(data.Items);
        }
    });
};

exports.getTodosByUser = (req, res) => {
    const params = {
        TableName: 'dev-todos',
        FilterExpression: "UserId = :user_id",
        ExpressionAttributeValues: {
            ":user_id": req.params.userId
        }
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Cannot fetch data from DynamoDB'});
        } else {
            console.log("Scan succeeded:", JSON.stringify(data, null, 2));
            // Sort the todos by timestamp in descending order
            const sortedTodos = data.Items.sort((a, b) => b.timestamp - a.timestamp);
            res.status(200).json(sortedTodos);
        }
    });
};

exports.createTodo = (req, res) => {

    const TodoId = uuidv4();

    const params = {
        TableName: 'dev-todos',
        Item: {
            UserId: req.body.userId,
            TodoId,
            title: req.body.title,
            completed: false,
            timestamp: Date.now() // Add the timestamp
        }
    };

    dynamodb.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Could not load items'});
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            res.status(200).json({success: true});
        }
    });
};

exports.updateTodo = (req, res) => {
    const params = {
        TableName: 'dev-todos',
        Key: {
            TodoId: req.body.id
        },
        UpdateExpression: "set title = :t, completed = :c",
        ExpressionAttributeValues: {
            ":t": req.body.title,
            ":c": req.body.completed
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, (err, data) => {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Could not update item'});
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            res.status(200).json({success: true});
        }
    });
};

exports.deleteTodo = (req, res) => {

    console.log(req.body)
    const params = {
        TableName: 'dev-todos',
        Key: {
            TodoId: req.params.todoId,
        }
    };

    dynamodb.delete(params, (err, data) => {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Could not delete item'});
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            res.status(200).json({success: true});
        }
    });
};