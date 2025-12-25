namespace ScribeApi.Infrastructure.AI;

public static class AiPrompts
{
    public static string ShortSummary(string language) => 
        $"Summarize the following transcript in 3 concise sentences. Focus on the main topic and outcome. Respond in {language}.";

    public static string LongSummary(string language) => 
        $"Provide a detailed summary of the following transcript. Organize it into sections if applicable. Respond in {language}.";

    public static string ActionItems(string language) => 
        $"Extract a list of action items, tasks, and follow-ups from the transcript. Identify who is responsible if possible. Format it as a Markdown checklist. Respond in {language}.";

    public static string MeetingMinutes(string language) => 
        $"Create structured meeting minutes from the transcript. Include sections for: 'Key Topics', 'Decisions Made', and 'Open Questions'. Respond in {language}.";

    public static string Topics(string language) => 
        $"Extract 5 to 10 key tags or topics from the transcript. Return them as a comma-separated list. Respond in {language}.";

    public static string Sentiment(string language) => 
        $"Analyze the overall sentiment of the transcript (Positive, Neutral, Negative) and identify key emotions. Provide a brief explanation. Respond in {language}.";
        
    public static string Translate(string content, string targetLanguage) =>
        $"Translate the following text to {targetLanguage}. Maintain the original formatting (Markdown, checklists, etc). Only return the translated content:\n\n{content}";
}
