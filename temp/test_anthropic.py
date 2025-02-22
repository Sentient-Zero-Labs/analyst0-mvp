import anthropic
import os

# Read API key from file
with open('../../calude_key', 'r') as f:
    api_key = f.read().strip()

# Set environment variable
os.environ["ANTHROPIC_API_KEY"] = api_key

client = anthropic.Anthropic()  # It will automatically use the environment variable

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=8192,
    temperature=1,
    messages=[{
        "role": "user",
        "content": "Hello, Claude!"
    }]
)
print(message.content)
