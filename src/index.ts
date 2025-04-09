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
  ListChannelsResponseSchema,
  GetUsersResponseSchema,
  GetUserProfileResponseSchema,
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
    switch (request.params.name) {
      case 'slack_list_channels': {
        const args = ListChannelsRequestSchema.parse(request.params.arguments);
        const response = await slackClient.conversations.list({
          limit: args.limit,
          cursor: args.cursor,
          types: 'public_channel', // Only public channels
        });
        if (!response.ok) {
          throw new Error(`Failed to list channels: ${response.error}`);
        }
        const parsed = ListChannelsResponseSchema.parse(response);

        return {
          content: [{ type: 'text', text: JSON.stringify(parsed) }],
        };
      }

      case 'slack_post_message': {
        const args = PostMessageRequestSchema.parse(request.params.arguments);
        const response = await slackClient.chat.postMessage({
          channel: args.channel_id,
          text: args.text,
        });
        if (!response.ok) {
          throw new Error(`Failed to post message: ${response.error}`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_reply_to_thread': {
        const args = ReplyToThreadRequestSchema.parse(request.params.arguments);
        const response = await slackClient.chat.postMessage({
          channel: args.channel_id,
          thread_ts: args.thread_ts,
          text: args.text,
        });
        if (!response.ok) {
          throw new Error(`Failed to reply to thread: ${response.error}`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }
      case 'slack_add_reaction': {
        const args = AddReactionRequestSchema.parse(request.params.arguments);
        const response = await slackClient.reactions.add({
          channel: args.channel_id,
          timestamp: args.timestamp,
          name: args.reaction,
        });
        if (!response.ok) {
          throw new Error(`Failed to add reaction: ${response.error}`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_channel_history': {
        const args = GetChannelHistoryRequestSchema.parse(
          request.params.arguments
        );
        const response = await slackClient.conversations.history({
          channel: args.channel_id,
          limit: args.limit,
          cursor: args.cursor,
        });
        if (!response.ok) {
          throw new Error(`Failed to get channel history: ${response.error}`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_thread_replies': {
        const args = GetThreadRepliesRequestSchema.parse(
          request.params.arguments
        );
        const response = await slackClient.conversations.replies({
          channel: args.channel_id,
          ts: args.thread_ts,
          limit: args.limit,
          cursor: args.cursor,
        });
        if (!response.ok) {
          throw new Error(`Failed to get thread replies: ${response.error}`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response) }],
        };
      }

      case 'slack_get_users': {
        const args = GetUsersRequestSchema.parse(request.params.arguments);
        const response = await slackClient.users.list({
          limit: args.limit,
          cursor: args.cursor,
        });
        if (!response.ok) {
          throw new Error(`Failed to get users: ${response.error}`);
        }
        const parsed = GetUsersResponseSchema.parse(response);

        return {
          content: [{ type: 'text', text: JSON.stringify(parsed) }],
        };
      }

      case 'slack_get_user_profile': {
        const args = GetUserProfileRequestSchema.parse(
          request.params.arguments
        );
        const response = await slackClient.users.profile.get({
          user: args.user_id,
        });
        if (!response.ok) {
          throw new Error(`Failed to get user profile: ${response.error}`);
        }
        const parsed = GetUserProfileResponseSchema.parse(response);
        return {
          content: [{ type: 'text', text: JSON.stringify(parsed) }],
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
