# LibreChat Multi-LLM Configuration

This LibreChat instance is configured to provide multiple LLM providers with pre-configured API keys, allowing users to select different models without needing to provide their own API keys.

## Available LLM Providers

The following providers are configured and available to users:

### 1. OpenAI
- **Models**: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo, o1-preview, o1-mini
- **Features**: Chat, code generation, analysis
- **API Key Required**: Yes (pre-configured)

### 2. Anthropic Claude
- **Models**: Claude-3.5-sonnet, Claude-3.5-haiku, Claude-3-opus, Claude-3-sonnet, Claude-3-haiku
- **Features**: Advanced reasoning, long context, safety-focused
- **API Key Required**: Yes (pre-configured)

### 3. Google Gemini
- **Models**: Gemini-2.0-flash-exp, Gemini-1.5-pro, Gemini-1.5-flash, Gemini-1.0-pro
- **Features**: Multimodal capabilities, fast inference
- **API Key Required**: Yes (pre-configured)

### 4. Groq (Fast Inference)
- **Models**: Llama-3.1-70b, Llama-3.1-8b, Mixtral-8x7b, Gemma2-9b
- **Features**: Ultra-fast inference, open-source models
- **API Key Required**: Yes (pre-configured)

### 5. OpenRouter
- **Models**: Access to multiple providers through one API
- **Features**: Model diversity, competitive pricing
- **API Key Required**: Yes (pre-configured)

### 6. Mistral AI
- **Models**: Mistral-large, Mistral-medium, Mistral-small, Codestral
- **Features**: European AI, code-specialized models
- **API Key Required**: Yes (pre-configured)

### 7. Perplexity AI
- **Models**: Sonar models with online search, Llama-3.1 variants
- **Features**: Real-time web search integration
- **API Key Required**: Yes (pre-configured)

## Setup Instructions

### 1. Configure API Keys

Edit the `.env` file and replace the placeholder values with your actual API keys:

```bash
# Required API Keys - Replace with your actual keys
OPENAI_API_KEY=your_actual_openai_api_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
GOOGLE_KEY=your_actual_google_api_key_here
GROQ_API_KEY=your_actual_groq_api_key_here
OPENROUTER_KEY=your_actual_openrouter_api_key_here
MISTRAL_API_KEY=your_actual_mistral_api_key_here
PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here
```

### 2. Obtain API Keys

#### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and navigate to API keys
3. Generate a new API key

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key

#### Google (Gemini)
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a project and generate an API key

#### Groq
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up and create an API key

#### OpenRouter
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and generate an API key

#### Mistral AI
1. Visit [Mistral Platform](https://console.mistral.ai/)
2. Create an account and generate an API key

#### Perplexity AI
1. Visit [Perplexity API](https://www.perplexity.ai/settings/api)
2. Create an account and generate an API key

### 3. Start the Application

```bash
# Start the backend
npm run backend:dev

# Start the frontend (in another terminal)
npm run frontend:dev
```

### 4. User Experience

Users will see a dropdown menu with all available providers and can:
- Select any provider without entering API keys
- Switch between different models within each provider
- Enjoy the full feature set of each LLM provider

## File Configuration

The configuration supports file uploads for compatible providers:
- **Images**: All providers support image uploads
- **PDFs**: Supported for document analysis
- **Text files**: For code review and analysis

## Security Notes

- API keys are stored server-side and never exposed to users
- Each provider has rate limiting and usage controls
- Monitor API usage through each provider's dashboard
- Consider implementing user quotas for cost management

## Cost Management

- Monitor usage across all providers
- Set up billing alerts in each provider's console
- Consider implementing user limits or subscription tiers
- Track usage patterns to optimize provider selection

## Troubleshooting

1. **Provider not showing**: Check API key configuration in `.env`
2. **Model errors**: Verify API key has access to specific models
3. **Rate limits**: Check provider dashboards for usage limits
4. **Connection issues**: Ensure all required environment variables are set

For more detailed configuration options, see the [LibreChat documentation](https://www.librechat.ai/docs/).