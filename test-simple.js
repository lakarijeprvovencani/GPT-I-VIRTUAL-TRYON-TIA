const { VertexAI } = require('@google-cloud/vertexai');

async function testModel() {
  try {
    const vertex = new VertexAI({ 
      project: 'gen-lang-client-0136634075', 
      location: 'global' 
    });
    
    const model = vertex.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview' 
    });

    console.log('Testing model with simple text prompt...');
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Hello, can you generate an image?' }] 
      }]
    });

    console.log('Response:', JSON.stringify(result.response, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModel();
