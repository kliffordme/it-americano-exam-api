const AWS = require('../config/aws-config');  // Adjust path as necessary
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.getComments = (req, res) => {
    const params = {
        TableName: 'dev-comments',
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

exports.getCommentsByUser = (req, res) => {
    const params = {
        TableName: 'dev-comments',
        FilterExpression: "TodoId = :todo_id",
        ExpressionAttributeValues: {
            ":todo_id": req.params.todoId
        }
    };

    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Cannot fetch data from DynamoDB'});
        } else {
            console.log("Scan succeeded:", JSON.stringify(data, null, 2));
            // Sort the comments by timestamp in descending order
            const sortedComments = data.Items.sort((a, b) => b.timestamp - a.timestamp);
            res.status(200).json(sortedComments);
        }
    });
};

exports.createComment = (req, res) => {

    const CommentId = uuidv4();

    const params = {
        TableName: 'dev-comments',
        Item: {
            TodoId: req.body.todoId,
            CommentId,
            comment: req.body.comment,
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

exports.updateComment = (req, res) => {
    console.log(req.body)
    const params = {
        TableName: 'dev-comments',
        Key: {
            CommentId: req.body.id
        },
        UpdateExpression: "set #cm = :c",
        ExpressionAttributeValues: {
            ":c": req.body.comment
        },
        ExpressionAttributeNames: {
            "#cm": "comment"
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

exports.deleteComment = (req, res) => {

    console.log(req.body)
    const params = {
        TableName: 'dev-comments',
        Key: {
            CommentId: req.params.commentId,
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