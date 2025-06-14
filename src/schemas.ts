import { z } from 'zod';

//
// Basic schemas
//

export const ChannelSchema = z
  .object({
    conversation_host_id: z.string().optional(),
    created: z.number().optional(),
    id: z.string().optional(),
    is_archived: z.boolean().optional(),
    name: z.string().optional(),
    name_normalized: z.string().optional(),
    num_members: z.number().optional(),
    purpose: z
      .object({
        creator: z.string().optional(),
        last_set: z.number().optional(),
        value: z.string().optional(),
      })
      .optional(),
    shared_team_ids: z.array(z.string()).optional(),
    topic: z
      .object({
        creator: z.string().optional(),
        last_set: z.number().optional(),
        value: z.string().optional(),
      })
      .optional(),
    updated: z.number().optional(),
  })
  .strip();

const ReactionSchema = z
  .object({
    count: z.number().optional(),
    name: z.string().optional(),
    url: z.string().optional(),
    users: z.array(z.string()).optional(),
  })
  .strip();

const ConversationsHistoryMessageSchema = z
  .object({
    reactions: z.array(ReactionSchema).optional(),
    reply_count: z.number().optional(),
    reply_users: z.array(z.string()).optional(),
    reply_users_count: z.number().optional(),
    subtype: z.string().optional(),
    text: z.string().optional(),
    thread_ts: z.string().optional(),
    ts: z.string().optional(),
    type: z.string().optional(),
    user: z.string().optional(),
  })
  .strip();

const MemberSchema = z
  .object({
    deleted: z.boolean().optional(),
    id: z.string().optional(),
    is_admin: z.boolean().optional(),
    is_app_user: z.boolean().optional(),
    is_bot: z.boolean().optional(),
    is_connector_bot: z.boolean().optional(),
    is_email_confirmed: z.boolean().optional(),
    is_invited_user: z.boolean().optional(),
    is_owner: z.boolean().optional(),
    is_primary_owner: z.boolean().optional(),
    is_restricted: z.boolean().optional(),
    is_ultra_restricted: z.boolean().optional(),
    is_workflow_bot: z.boolean().optional(),
    name: z.string().optional(),
    real_name: z.string().optional(),
    team_id: z.string().optional(),
    updated: z.number().optional(),
  })
  .strip();

const ProfileSchema = z
  .object({
    display_name: z.string().optional(),
    display_name_normalized: z.string().optional(),
    email: z.string().email().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    real_name: z.string().optional(),
    real_name_normalized: z.string().optional(),
    title: z.string().optional(),
  })
  .strip();

const SearchMessageSchema = z
  .object({
    channel: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    permalink: z.string().url().optional(),
    text: z.string().optional(),
    ts: z.string().optional(),
    type: z.string().optional(),
    user: z.string().optional(),
  })
  .strip();

//
// Request schemas
//

export const AddReactionRequestSchema = z.object({
  channel_id: z
    .string()
    .describe('The ID of the channel containing the message'),
  reaction: z.string().describe('The name of the emoji reaction (without ::)'),
  timestamp: z
    .string()
    .regex(/^\d{10}\.\d{6}$/, {
      message: "Timestamp must be in the format '1234567890.123456'",
    })
    .describe(
      "The timestamp of the message to react to in the format '1234567890.123456'"
    ),
});

export const GetChannelHistoryRequestSchema = z.object({
  channel_id: z.string().describe('The ID of the channel'),
  cursor: z
    .string()
    .optional()
    .describe('Pagination cursor for next page of results'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000) // Align with Slack API's default limit
    .optional()
    .default(100) // The reference repository uses 10, but aligning with list_channels etc., set to 100
    .describe('Number of messages to retrieve (default 100)'),
});

export const GetThreadRepliesRequestSchema = z.object({
  channel_id: z
    .string()
    .describe('The ID of the channel containing the thread'),
  thread_ts: z
    .string()
    .regex(/^\d{10}\.\d{6}$/, {
      message: "Timestamp must be in the format '1234567890.123456'",
    })
    .describe(
      "The timestamp of the parent message in the format '1234567890.123456'. Timestamps in the format without the period can be converted by adding the period such that 6 numbers come after it."
    ),
  cursor: z
    .string()
    .optional()
    .describe('Pagination cursor for next page of results'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .describe('Number of replies to retrieve (default 100)'),
});

export const GetUsersRequestSchema = z.object({
  cursor: z
    .string()
    .optional()
    .describe('Pagination cursor for next page of results'),
  limit: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(100)
    .describe('Maximum number of users to return (default 100)'),
});

export const GetUserProfileRequestSchema = z.object({
  user_id: z.string().describe('The ID of the user'),
});

export const GetUserProfilesRequestSchema = z.object({
  user_ids: z
    .array(z.string())
    .min(1)
    .max(100)
    .describe('Array of user IDs to retrieve profiles for (max 100)'),
});

export const ListChannelsRequestSchema = z.object({
  cursor: z
    .string()
    .optional()
    .describe('Pagination cursor for next page of results'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000) // Align with Slack API's default limit (conversations.list is actually cursor-based)
    .optional()
    .default(100)
    .describe('Maximum number of channels to return (default 100)'),
});

export const PostMessageRequestSchema = z.object({
  channel_id: z.string().describe('The ID of the channel to post to'),
  text: z.string().describe('The message text to post'),
  file_ids: z
    .array(z.string())
    .nonempty()
    .optional()
    .describe('IDs of already uploaded files to include in the message'),
});

export const ReplyToThreadRequestSchema = z.object({
  channel_id: z
    .string()
    .describe('The ID of the channel containing the thread'),
  text: z.string().describe('The reply text'),
  thread_ts: z
    .string()
    .regex(/^\d{10}\.\d{6}$/, {
      message: "Timestamp must be in the format '1234567890.123456'",
    })
    .describe(
      "The timestamp of the parent message in the format '1234567890.123456'. Timestamps in the format without the period can be converted by adding the period such that 6 numbers come after it."
    ),
});

export const SearchMessagesRequestSchema = z.object({
  query: z.string().optional().default('').describe('Basic search query'),

  in_channel: z
    .string()
    .optional()
    .describe('Search within a specific channel (channel name or ID)'),
  in_group: z
    .string()
    .optional()
    .describe('Search within a specific private group (group name or ID)'),
  in_dm: z
    .string()
    .optional()
    .describe('Search within a specific direct message (user ID)'),
  from_user: z
    .string()
    .optional()
    .describe('Search for messages from a specific user (username or ID)'),
  from_bot: z
    .string()
    .optional()
    .describe('Search for messages from a specific bot (bot name)'),

  highlight: z
    .boolean()
    .optional()
    .default(false)
    .describe('Enable highlighting of search results'),
  sort: z
    .enum(['score', 'timestamp'])
    .optional()
    .default('score')
    .describe('Search result sort method (score or timestamp)'),
  sort_dir: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Sort direction (ascending or descending)'),

  count: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Number of results per page (max 100)'),
  page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe('Page number of results (max 100)'),
});

const SearchPaginationSchema = z.object({
  first: z.number().optional(),
  last: z.number().optional(),
  page: z.number().optional(),
  page_count: z.number().optional(),
  per_page: z.number().optional(),
  total_count: z.number().optional(),
});

//
// Response schemas
//

const BaseResponseSchema = z
  .object({
    error: z.string().optional(),
    ok: z.boolean().optional(),
    response_metadata: z
      .object({
        next_cursor: z.string().optional(),
      })
      .optional(),
  })
  .strip();

export const ConversationsHistoryResponseSchema = BaseResponseSchema.extend({
  messages: z.array(ConversationsHistoryMessageSchema).optional(),
});

export const ConversationsRepliesResponseSchema = BaseResponseSchema.extend({
  messages: z.array(ConversationsHistoryMessageSchema).optional(),
});

export const GetUsersResponseSchema = BaseResponseSchema.extend({
  members: z.array(MemberSchema).optional(),
});

export const GetUserProfileResponseSchema = BaseResponseSchema.extend({
  profile: ProfileSchema.optional(),
});

export const GetUserProfilesResponseSchema = z.object({
  profiles: z.array(
    z.object({
      user_id: z.string(),
      profile: ProfileSchema.optional(),
      error: z.string().optional(),
    })
  ),
});

export const ListChannelsResponseSchema = BaseResponseSchema.extend({
  channels: z.array(ChannelSchema).optional(),
});

export const SearchMessagesResponseSchema = BaseResponseSchema.extend({
  messages: z
    .object({
      matches: z.array(SearchMessageSchema).optional(),
      pagination: SearchPaginationSchema.optional(),
    })
    .optional(),
});

//
// File-related schemas
//

export const FileSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    mimetype: z.string().optional(),
    filetype: z.string().optional(),
    size: z.number().optional(),
    url_private: z.string().url().optional(),
    url_private_download: z.string().url().optional(),
  })
  .strip();

export const UploadFileRequestSchema = z.object({
  filename: z.string().describe('Name of the file to upload'),
  content_base64: z
    .string()
    .describe('Base64 encoded file contents to upload'),
  title: z.string().optional().describe('Title of the file in Slack'),
  channel_id: z
    .string()
    .optional()
    .describe('Channel or DM conversation ID to share the file'),
});

export const UploadFileResponseSchema = BaseResponseSchema.extend({
  file: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
});

export const ListFilesRequestSchema = z.object({
  user: z.string().optional().describe('Filter files created by user ID'),
  channel: z
    .string()
    .optional()
    .describe('Filter files visible in a channel'),
  types: z
    .string()
    .optional()
    .describe('Filter by file types (comma separated)'),
  ts_from: z
    .string()
    .optional()
    .describe('Filter for files created after this timestamp (UNIX epoch in seconds)'),
  ts_to: z
    .string()
    .optional()
    .describe('Filter for files created before this timestamp (UNIX epoch in seconds)'),
  cursor: z
    .string()
    .optional()
    .describe('Pagination cursor for next page of results'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .describe('Maximum number of files to return'),
});

export const ListFilesResponseSchema = BaseResponseSchema.extend({
  files: z.array(FileSchema).optional(),
});

export const GetFileInfoRequestSchema = z.object({
  file_id: z.string().describe('ID of the file to fetch'),
});

export const GetFileInfoResponseSchema = BaseResponseSchema.extend({
  file: FileSchema.optional(),
});

export const DeleteFileRequestSchema = z.object({
  file_id: z.string().describe('ID of the file to delete'),
});

export const SendFileMessageRequestSchema = z.object({
  channel_id: z.string().describe('Channel or DM to post the file in'),
  file_ids: z
    .array(z.string())
    .nonempty()
    .describe('IDs of the files to send'),
  text: z.string().optional().describe('Additional message text'),
});
