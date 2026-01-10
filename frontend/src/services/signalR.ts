"use client";

import * as signalR from "@microsoft/signalr";

// SignalR event types from backend
export interface JobStatusUpdateEvent {
    jobId: string;
    status: string;
    processingStep: string | null;
}

export interface JobCompletedEvent {
    jobId: string;
}

export interface JobFailedEvent {
    jobId: string;
    errorMessage: string;
}

export interface TranslationStatusUpdateEvent {
    jobId: string;
    translationStatus: string | null;
    translatingToLanguage: string | null;
}

// Analytics Events
// The payload is likely just TranscriptionAnalysisDto, so jobId might be missing if not expanded.
export interface AnalysisEventPayload {
    id: string;
    // jobId: string; // Removing strict requirement for jobId as it's not in the DTO
    analysisType: string;
    content: string;
    translations: Record<string, string>;
    createdAtUtc: string;
    status: "Pending" | "Processing" | "Completed" | "Failed";
    errorMessage?: string | null;
}

export type AnalysisProcessingEvent = AnalysisEventPayload;
export type AnalysisCompletedEvent = AnalysisEventPayload;
export type AnalysisFailedEvent = AnalysisEventPayload;

// Event handler types
type JobStatusUpdateHandler = (event: JobStatusUpdateEvent) => void;
type JobCompletedHandler = (event: JobCompletedEvent) => void;
type JobFailedHandler = (event: JobFailedEvent) => void;
type TranslationStatusUpdateHandler = (event: TranslationStatusUpdateEvent) => void;

type AnalysisProcessingHandler = (event: AnalysisProcessingEvent) => void;
type AnalysisCompletedHandler = (event: AnalysisCompletedEvent) => void;
type AnalysisFailedHandler = (event: AnalysisFailedEvent) => void;

// Singleton SignalR connection manager
class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private isConnecting = false;

    // Event handlers
    private onJobStatusUpdate: JobStatusUpdateHandler | null = null;
    private onJobCompleted: JobCompletedHandler | null = null;
    private onJobFailed: JobFailedHandler | null = null;
    private onTranslationStatusUpdate: TranslationStatusUpdateHandler | null = null;

    private onAnalysisProcessing: AnalysisProcessingHandler | null = null;
    private onAnalysisCompleted: AnalysisCompletedHandler | null = null;
    private onAnalysisFailed: AnalysisFailedHandler | null = null;

    // Get hub URL - derive from API URL by stripping /api/ suffix
    private getHubUrl(): string {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5150/api/";
        // Remove trailing /api/ or /api to get base URL
        const baseUrl = apiUrl.replace(/\/api\/?$/, "");
        return `${baseUrl}/hubs/transcription`;
    }

    // Connect to SignalR hub
    async connect(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log("[SignalR] Already connected");
            return;
        }

        if (this.isConnecting) {
            console.log("[SignalR] Connection already in progress");
            return;
        }

        this.isConnecting = true;

        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(this.getHubUrl(), {
                    withCredentials: true, // Send cookies for auth
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        // Exponential backoff: 0, 2s, 4s, 8s, max 30s
                        const delay = Math.min(
                            Math.pow(2, retryContext.previousRetryCount) * 1000,
                            30000
                        );
                        console.log(`[SignalR] Reconnecting in ${delay}ms...`);
                        return delay;
                    },
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Register event handlers
            this.registerHandlers();

            // Connection lifecycle events
            this.connection.onreconnecting(() => {
                console.log("[SignalR] Reconnecting...");
            });

            this.connection.onreconnected(() => {
                console.log("[SignalR] Reconnected");
            });

            this.connection.onclose((error) => {
                console.log("[SignalR] Connection closed", error);
            });

            await this.connection.start();
            console.log("[SignalR] Connected");
        } catch (error) {
            console.error("[SignalR] Connection failed:", error);
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    // Disconnect from hub
    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log("[SignalR] Disconnected");
            } catch (error) {
                console.error("[SignalR] Disconnect error:", error);
            }
            this.connection = null;
        }
    }

    // Register all event handlers on the connection
    private registerHandlers(): void {
        if (!this.connection) return;

        this.connection.on("JobStatusUpdate", (event: JobStatusUpdateEvent) => {
            console.log("[SignalR] JobStatusUpdate:", event);
            this.onJobStatusUpdate?.(event);
        });

        this.connection.on("JobCompleted", (event: JobCompletedEvent) => {
            console.log("[SignalR] JobCompleted:", event);
            this.onJobCompleted?.(event);
        });

        this.connection.on("JobFailed", (event: JobFailedEvent) => {
            console.log("[SignalR] JobFailed:", event);
            this.onJobFailed?.(event);
        });

        this.connection.on("TranslationStatusUpdate", (event: TranslationStatusUpdateEvent) => {
            console.log("[SignalR] TranslationStatusUpdate:", event);
            this.onTranslationStatusUpdate?.(event);
        });

        this.connection.on("AnalysisProcessing", (event: AnalysisProcessingEvent) => {
            console.log("[SignalR] AnalysisProcessing:", event);
            this.onAnalysisProcessing?.(event);
        });

        this.connection.on("AnalysisCompleted", (event: AnalysisCompletedEvent) => {
            console.log("[SignalR] AnalysisCompleted:", event);
            this.onAnalysisCompleted?.(event);
        });

        this.connection.on("AnalysisFailed", (event: AnalysisFailedEvent) => {
            console.log("[SignalR] AnalysisFailed:", event);
            this.onAnalysisFailed?.(event);
        });
    }

    // Set event handlers
    setOnJobStatusUpdate(handler: JobStatusUpdateHandler | null): void {
        this.onJobStatusUpdate = handler;
    }

    setOnJobCompleted(handler: JobCompletedHandler | null): void {
        this.onJobCompleted = handler;
    }

    setOnJobFailed(handler: JobFailedHandler | null): void {
        this.onJobFailed = handler;
    }

    setOnTranslationStatusUpdate(handler: TranslationStatusUpdateHandler | null): void {
        this.onTranslationStatusUpdate = handler;
    }

    setOnAnalysisProcessing(handler: AnalysisProcessingHandler | null): void {
        this.onAnalysisProcessing = handler;
    }

    setOnAnalysisCompleted(handler: AnalysisCompletedHandler | null): void {
        this.onAnalysisCompleted = handler;
    }

    setOnAnalysisFailed(handler: AnalysisFailedHandler | null): void {
        this.onAnalysisFailed = handler;
    }

    // Get connection state
    getState(): signalR.HubConnectionState {
        return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Export singleton instance
export const signalRService = new SignalRService();
