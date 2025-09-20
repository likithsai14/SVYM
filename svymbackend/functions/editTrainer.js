const Trainer = require('./models/Trainer'); // assuming you define the schema in models/FieldMobiliser.js

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body);

    const filter = {};
    if (body.email) { filter.email = body.email; } 
    else if (body.mobile) { filter.mobile = body.mobile;} 
    

    const trainers = await Trainer.find(filter);

    if(trainers.length!==0){
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Trainer with given email or mobile already exists.' })
      }
    }

    const trainer = new Trainer(body);
    const uniqueSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const userId = `SVYMT${uniqueSuffix}`;
    const hashedPassword = await bcrypt.hash(uniqueSuffix, 10);
    trainer.trianerId = userId;
    trainer.password = hashedPassword;
    await Trainer.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ fieldmobilisers })
    };
  } catch (error) {
    console.error('Netlify Function error:', error);

    if (error.message.includes('authorization') || error.message.includes('authentication')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to MongoDB. Check environment variables.' })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
