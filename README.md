# slack-mcp-server

A [MCP(Model Context Protocol)](https://www.anthropic.com/news/model-context-protocol) server for accessing Slack API. This server allows AI assistants to interact with the Slack API through a standardized interface.

## Transport Support

This server supports both traditional and modern MCP transport methods:

- **Stdio Transport** (default): Process-based communication for local integration
- **Streamable HTTP Transport**: HTTP-based communication for web applications and remote clients

## Features

Available tools:

- `slack_list_channels` - List public channels in the workspace with pagination
- `slack_post_message` - Post a new message to a Slack channel (optionally include files or images)
- `slack_reply_to_thread` - Reply to a specific message thread in Slack
- `slack_add_reaction` - Add a reaction emoji to a message
- `slack_get_channel_history` - Get recent messages from a channel
- `slack_get_thread_replies` - Get all replies in a message thread
- `slack_get_users` - Retrieve basic profile information of all users in the workspace
- `slack_get_user_profile` - Get a user's profile information
- `slack_get_user_profiles` - Get multiple users' profile information in bulk (efficient for batch operations)
- `slack_search_messages` - Search for messages in the workspace
- `slack_upload_file` - Upload a file and optionally share it
- `slack_list_files` - List files visible to the authenticated user
- `slack_get_file_info` - Get metadata about a file
- `slack_delete_file` - Delete a file the bot owns
- `slack_send_file` - Send existing files or images in a message

## Quick Start

### Installation

```bash
npm install @ubie-oss/slack-mcp-server
```

NOTE: Its now hosted in GitHub Registry so you need your PAT.

### Configuration

You need to set the following environment variables:

- `SLACK_BOT_TOKEN`: Slack Bot User OAuth Token

> **Note**
> A separate user-level token is **no longer required**. All operations –
> including file uploads, downloads and message search – are performed via the
> bot token, provided it has the appropriate OAuth scopes.

You can also create a `.env` file to set these environment variables:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

Your Slack app must include the following OAuth scopes **on the bot token**:

- `chat:write` – post messages and share files
- `files:write` – upload and delete files
- `files:read` – list and fetch file info
- `search:read` – (optional) enable message search via `slack_search_messages`

Image files are automatically sent using Slack image blocks when possible.

### Usage

#### Start the MCP server

**Stdio Transport (default)**:
```bash
npx @ubie-oss/slack-mcp-server
```

**Streamable HTTP Transport**:
```bash
npx @ubie-oss/slack-mcp-server -port 3000
```

You can also run the installed module with node:
```bash
# Stdio transport
node node_modules/.bin/slack-mcp-server

# HTTP transport  
node node_modules/.bin/slack-mcp-server -port 3000
```

**Command Line Options**:
- `-port <number>`: Start with Streamable HTTP transport on specified port
- `-h, --help`: Show help message

#### Client Configuration

**For Stdio Transport (Claude Desktop, etc.)**:

```json
{
  "slack": {
    "command": "npx",
    "args": [
      "-y",
      "@ubie-oss/slack-mcp-server"
    ],
    "env": {
      "NPM_CONFIG_//npm.pkg.github.com/:_authToken": "<your-github-pat>",
      "SLACK_BOT_TOKEN": "<your-bot-token>",
      "SLACK_USER_TOKEN": "<your-user-token>"
    }
  }
}
```

**For Streamable HTTP Transport (Web applications)**:

Start the server:
```bash
SLACK_BOT_TOKEN=<your-bot-token> npx @ubie-oss/slack-mcp-server -port 3000
```

Connect to: `http://localhost:3000/mcp`

See [examples/README.md](examples/README.md) for detailed client examples.

## Implementation Pattern

This server adopts the following implementation pattern:

1. Define request/response using Zod schemas
   - Request schema: Define input parameters
   - Response schema: Define responses limited to necessary fields

2. Implementation flow:
   - Validate request with Zod schema
   - Call Slack WebAPI
   - Parse response with Zod schema to limit to necessary fields
   - Return as JSON

For example, the `slack_list_channels` implementation parses the request with `ListChannelsRequestSchema`, calls `slackClient.conversations.list`, and returns the response parsed with `ListChannelsResponseSchema`.

## Development

### Available Scripts

- `npm run dev` - Start the server in development mode with hot reloading
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run lint` - Run linting checks (ESLint and Prettier)
- `npm run fix` - Automatically fix linting issues

### Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests and linting: `npm run lint`
4. Commit your changes
5. Push to the branch
6. Create a Pull Request
