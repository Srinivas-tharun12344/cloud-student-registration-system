const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(__dirname));

// ✅ AWS CONFIG (IMPORTANT)
AWS.config.update({
    region: 'us-east-1'   // MUST match your DynamoDB region
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE = "Students";


// ===================== CREATE =====================
app.post('/register', async (req, res) => {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(400).send("All fields are required");
    }

    const params = {
        TableName: TABLE,
        Item: {
            email: email,
            name: name,
            course: course
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.send("Student Registered Successfully");
    } catch (err) {
        console.error("REGISTER ERROR:", err);   // 🔥 DEBUG
        res.status(500).send("Error registering student");
    }
});


// ===================== READ =====================
app.get('/students', async (req, res) => {
    const params = {
        TableName: TABLE
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (err) {
        console.error("FETCH ERROR:", err);   // 🔥 DEBUG
        res.status(500).send("Error fetching students");
    }
});


// ===================== UPDATE =====================
app.put('/update', async (req, res) => {
    const { email, name, course } = req.body;

    const params = {
        TableName: TABLE,
        Key: { email: email },
        UpdateExpression: "set #n = :name, course = :course",
        ExpressionAttributeNames: {
            "#n": "name"
        },
        ExpressionAttributeValues: {
            ":name": name,
            ":course": course
        }
    };

    try {
        await dynamoDB.update(params).promise();
        res.send("Student Updated Successfully");
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).send("Error updating student");
    }
});


// ===================== DELETE =====================
app.delete('/delete/:email', async (req, res) => {
    const params = {
        TableName: TABLE,
        Key: {
            email: req.params.email
        }
    };

    try {
        await dynamoDB.delete(params).promise();
        res.send("Student Deleted Successfully");
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).send("Error deleting student");
    }
});


// ===================== TEST ROUTE =====================
app.get('/test', (req, res) => {
    res.send("Server + DynamoDB working!");
});


// ===================== START SERVER =====================
app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 Server running on port 3000");
});
