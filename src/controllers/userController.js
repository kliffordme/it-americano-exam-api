const AWS = require('../config/aws-config'); // Make sure to adjust the path according to your project structure
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


exports.createUser = (req, res) => {
    // Check if password and confirmPassword match
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({error: 'Passwords do not match'});
    }

    // Generate a unique ID for the user
    const UserId = uuidv4();

    // Parameters for the scan operation
    const scanParams = {
        TableName: 'dev-users',
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": req.body.email
        }
    };

    // Check if the email already exists
    dynamodb.scan(scanParams, (err, data) => {
        if (err) {
            console.error("Unable to scan. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Could not scan users'});
        } else if (data.Items.length > 0) {
            // If the scan returns any items, that means the email already exists
            res.status(400).json({error: 'Email already exists'});
        } else {
            // Hash the password before saving in database
            bcrypt.hash(req.body.password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({error: 'Could not hash the password'});
                }

                // Create a new user object
                const newUser = {
                    UserId, // Use the generated UUID as the UserId
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword  // Store the hashed password
                    // Add more user data as needed
                };

                // Parameters for the put operation
                const putParams = {
                    TableName: 'dev-users',
                    Item: newUser
                };

                // Save the user to your DynamoDB table
                dynamodb.put(putParams, (err, data) => {
                    if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                        res.status(500).json({error: 'Could not create user'});
                    } else {
                        console.log("Added item:", JSON.stringify(data, null, 2));
                        // For security reasons, do not return the password in the response
                        delete newUser.password;
                        res.status(201).json(newUser);
                    }
                });
            });
        }
    });
};

exports.loginUser = (req, res) => {
    const scanParams = {
        TableName: 'dev-users',
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": req.body.email
        }
    };

    dynamodb.scan(scanParams, (err, data) => {
        if (err) {
            console.error("Unable to scan. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json({error: 'Error retrieving user'});
        } else {
            if (data.Items && data.Items.length > 0) {
                const user = data.Items[0];
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({UserId: user.UserId}, process.env.JWT_SECRET, {expiresIn: '1h'});
                        res.cookie('token', token, { 
                            // httpOnly: true, 
                            secure: true,  // use this if you are using https
                            // sameSite: 'strict', // use this if you want to restrict the cookie to the same site
                            // domain: 'your-domain.com', // specify your domain
                        });
                        res.status(200).json({auth: true});
                    } else {
                        res.status(401).json({auth: false, message: 'Invalid password'});
                    }
                });
            } else {
                res.status(404).json({error: 'User not found'});
            }
        }
    });
};