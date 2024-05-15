document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('question-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const question = form.querySelector('input[name="question"]').value;
        if (question) {
            const responseElement = document.getElementById('response');
            responseElement.textContent = 'Loading...';
            try {
                const relevantContent = getRelevantContent(question);
                const response = await askOpenAI(question, relevantContent);
                responseElement.textContent = response;
            } catch (error) {
                responseElement.textContent = 'Error: ' + error.message;
                console.error('Error details:', error);
            }
        }
    });
});

function getRelevantContent(question) {
    const lowerCaseQuestion = question.toLowerCase();
    let combinedContent = "";

    for (const [key, value] of Object.entries(websiteContent)) {
        if (lowerCaseQuestion.includes(key.toLowerCase())) {
            combinedContent += `${key}: ${value}\n\n`;
        }
    }

    if (!combinedContent) {
        for (const [key, value] of Object.entries(websiteContent)) {
            combinedContent += `${key}: ${value}\n\n`;
        }
    }

    return combinedContent;
}

async function askOpenAI(question, relevantContent) {
    const apiKey = '';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are an AI assistant with access to the following content from the website. Use only this content to answer questions. Here is the content:\n\n${relevantContent}` 
                    },
                    { role: 'user', content: question }
                ],
                max_tokens: 150,
                n: 1,
                stop: null,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Network response was not ok: ' + response.statusText + ' - ' + errorText);
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
}
