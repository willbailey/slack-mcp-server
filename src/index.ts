#!/usr/bin/env node

import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import {
  ListChannelsRequestSchema,
  PostMessageRequestSchema,
  ReplyToThreadRequestSchema,
  AddReactionRequestSchema,
  GetChannelHistoryRequestSchema,
  GetThreadRepliesRequestSchema,
  GetUsersRequestSchema,
  GetUserProfileRequestSchema,
} from './schemas.js';

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

const server = new Server(
  {
    name: 'slack-mcp-server',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'slack_list_channels',
        description: 'List public channels in the workspace with pagination',
        inputSchema: zodToJsonSchema(ListChannelsRequestSchema),
      },
      {
        name: 'slack_post_message',
        description: 'Post a new message to a Slack channel',
        inputSchema: zodToJsonSchema(PostMessageRequestSchema),
      },
      {
        name: 'slack_reply_to_thread',
        description: 'Reply to a specific message thread in Slack',
        inputSchema: zodToJsonSchema(ReplyToThreadRequestSchema),
      },
      {
        name: 'slack_add_reaction',
        description: 'Add a reaction emoji to a message',
        inputSchema: zodToJsonSchema(AddReactionRequestSchema),
      },
      {
        name: 'slack_get_channel_history',
        description: 'Get recent messages from a channel',
        inputSchema: zodToJsonSchema(GetChannelHistoryRequestSchema),
      },
      {
        name: 'slack_get_thread_replies',
        description: 'Get all replies in a message thread',
        inputSchema: zodToJsonSchema(GetThreadRepliesRequestSchema),
      },
      {
        name: 'slack_get_users',
        description:
          'Retrieve basic profile information of all users in the workspace',
        inputSchema: zodToJsonSchema(GetUsersRequestSchema),
      },
      {
        name: 'slack_get_user_profile',
        description: "Get a user's profile information",
        inputSchema: zodToJsonSchema(GetUserProfileRequestSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params) {
      throw new Error('Params are required');
    }
    const args = request.params.arguments || {};

    switch (request.params.name) {
      case 'slack_list_channels': {
        const parsedArgs = ListChannelsRequestSchema.parse(args);
        const response = await slackClient.conversations.list({
          limit: parsedArgs.limit,
          cursor: parsedArgs.cursor,
          types: 'public_channel', // List public channels
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_post_message': {
        const parsedArgs = PostMessageRequestSchema.parse(args);
        const response = await slackClient.chat.postMessage({
          channel: parsedArgs.channel_id,
          text: parsedArgs.text,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_reply_to_thread': {
        const parsedArgs = ReplyToThreadRequestSchema.parse(args);
        const response = await slackClient.chat.postMessage({
          channel: parsedArgs.channel_id,
          thread_ts: parsedArgs.thread_ts,
          text: parsedArgs.text,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }
      case 'slack_add_reaction': {
        const parsedArgs = AddReactionRequestSchema.parse(args);
        const response = await slackClient.reactions.add({
          channel: parsedArgs.channel_id,
          timestamp: parsedArgs.timestamp,
          name: parsedArgs.reaction,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_channel_history': {
        const parsedArgs = GetChannelHistoryRequestSchema.parse(args);
        const response = await slackClient.conversations.history({
          channel: parsedArgs.channel_id,
          limit: parsedArgs.limit,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_thread_replies': {
        const parsedArgs = GetThreadRepliesRequestSchema.parse(args);
        // conversations.replies API
        const response = await slackClient.conversations.replies({
          channel: parsedArgs.channel_id,
          ts: parsedArgs.thread_ts,
          // Specify limit and cursor
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_users': {
        const parsedArgs = GetUsersRequestSchema.parse(args);
        const response = await slackClient.users.list({
          limit: parsedArgs.limit,
          cursor: parsedArgs.cursor,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_user_profile': {
        const parsedArgs = GetUserProfileRequestSchema.parse(args);
        const response = await slackClient.users.profile.get({
          user: parsedArgs.user_id,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Slack MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
