export type TranscriptStatus = "missing" | "queued" | "stored" | "error";
export type PipelineStatus = "not_started" | "running" | "complete" | "error";
export type PublishStatus = "hidden" | "ready";

export interface ITranscriptStorage {
provider: "s3";
bucket?: string;
key?: string;
}

export interface ITopicCluster {
primary?: string;
secondary?: string[];
concepts?: string[];
}

export interface ITranscriptState {
status: TranscriptStatus;
storage?: ITranscriptStorage;
sha256?: string;
lastAttemptAt?: Date;
error?: { message: string; at: Date };
}

export interface IStageState {
status: PipelineStatus;
completedAt?: Date;
runId?: string;
lastAttemptAt?: Date;
error?: { message: string; at: Date };
}

export interface IEnrichmentState {
stage1: IStageState;
stage2: IStageState;
}

export interface IPublishState {
status: PublishStatus;
publishedAt?: Date;
}

export interface IWebPageTimeline {
from: string;
to: string;
title?: string;
description?: string;
}

const SponsorLinkObjectSchema = new Schema<ISponsorLinkObject>(
{
text: String,
links: [String],
hasCodeDave: Boolean,
code: String,
brand: String,
discountPercent: Number,
},
{ \_id: false },
);

const WebPageTimelineSchema = new Schema<IWebPageTimeline>(
{
from: String,
to: String,
title: String,
description: String,
},
{ \_id: false },
);

const ErrorInfoSchema = new Schema(
{ message: String, at: Date },
{ \_id: false },
);

const TranscriptStorageSchema = new Schema<ITranscriptStorage>(
{
provider: { type: String, enum: ["s3"], default: "s3" },
bucket: String,
key: String,
},
{ \_id: false },
);

const TranscriptStateSchema = new Schema<ITranscriptState>(
{
status: {
type: String,
enum: ["missing", "queued", "stored", "error"],
default: "missing",
index: true,
},
storage: { type: TranscriptStorageSchema, default: undefined },
sha256: String,
lastAttemptAt: Date,
error: { type: ErrorInfoSchema, default: undefined },
},
{ \_id: false },
);

const StageStateSchema = new Schema<IStageState>(
{
status: {
type: String,
enum: ["not_started", "running", "complete", "error"],
default: "not_started",
index: true,
},
completedAt: Date,
runId: String,
lastAttemptAt: Date,
error: { type: ErrorInfoSchema, default: undefined },
},
{ \_id: false },
);

const EnrichmentStateSchema = new Schema<IEnrichmentState>(
{
stage1: { type: StageStateSchema, default: () => ({}) },
stage2: { type: StageStateSchema, default: () => ({}) },
},
{ \_id: false },
);

export interface IEpisode {
id: string;
channelName: string;
episodeNumber?: number;
episodeTitle?: string;
publishedAt?: Date;
webPageSummary?: string;
webPageTimelines?: IWebPageTimeline[];
episodePageUrl?: string;
episodeTranscriptUrl?: string;
summaryShort?: string;
summaryDetailed?: string;

// add / keep
publishedSummary?: string;
keyTakeaways?: string[];

topicCluster?: ITopicCluster;

s3TranscriptKey?: string;
youtubeVideoId?: string;
youtubeEmbedUrl?: string;
youtubeWatchUrl?: string;
s3TranscriptUrl?: string;

transcript: ITranscriptState;
enrichment: IEnrichmentState;

}

const TopicClusterSchema = new Schema<ITopicCluster>(
{
primary: String,
secondary: [String],
concepts: [String],
},
{ \_id: false },
);

export type EpisodeDoc = HydratedDocument<IEpisode>;
