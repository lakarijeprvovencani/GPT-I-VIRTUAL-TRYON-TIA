const { VertexAI } = require('@google-cloud/vertexai');

async function testKnownModel() {
  try {
    const vertex = new VertexAI({ 
      project: 'gen-lang-client-0136634075', 
      location: 'global' 
    });
    
    // Test sa poznatim modelom koji sigurno radi
    const model = vertex.getGenerativeModel({ 
      model: 'gemini-1.5-flash' 
    });

    console.log('Testing with gemini-1.5-flash...');
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Say hello in Serbian' }] 
      }]
    });

    console.log('Response:', result.response.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testKnownModel();
