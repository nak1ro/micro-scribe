namespace ScribeApi.Infrastructure.AI;

public static class AiPrompts
{
    public static string ShortSummary(string language) => 
        $@"Summarize the following transcript in 3 concise sentences. Focus on the main topic and outcome. 
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""summary"": ""The summary text...""
           }}";

    public static string LongSummary(string language) => 
        $@"Provide a detailed summary of the following transcript. Organize it into sections.
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""sections"": [
                   {{ ""title"": ""Section Title"", ""content"": ""Section content..."" }}
               ]
           }}";

    public static string ActionItems(string language) => 
        $@"Extract a list of action items, tasks, and follow-ups from the transcript. Identify who is responsible if possible.
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""actionItems"": [
                   {{ ""task"": ""Task description"", ""owner"": ""Person responsible (or null)"", ""priority"": ""High/Medium/Low"" }}
               ]
           }}";

    public static string MeetingMinutes(string language) => 
        $@"Create structured meeting minutes from the transcript.
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""keyTopics"": [""Topic 1"", ""Topic 2""],
               ""decisions"": [""Decision 1"", ""Decision 2""],
               ""openQuestions"": [""Question 1"", ""Question 2""]
           }}";

    public static string Topics(string language) => 
        $@"Extract 5 to 10 key tags or topics from the transcript.
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""topics"": [""Tag1"", ""Tag2"", ""Tag3""]
           }}";

    public static string Sentiment(string language) => 
        $@"Analyze the overall sentiment of the transcript (Positive, Neutral, Negative) and identify key emotions.
           Respond in {language}.
           Return a JSON object with the following structure:
           {{
               ""sentiment"": ""Positive/Neutral/Negative"",
               ""confidenceScore"": 0.95,
               ""explanation"": ""Brief explanation of the sentiment analysis...""
           }}";
        
    public static string Translate(string content, string targetLanguage) =>
        $@"The following text is a JSON object. Translate all string values inside the JSON (including nested arrays and objects) to {targetLanguage}. 
           
           Rules:
           1. DO NOT translate the JSON keys (e.g. ""summary"", ""actionItems"", ""task"", ""owner"").
           2. Translate only the values.
           3. For ""priority"" values (High/Medium/Low), translate them to the target language equivalent.
           4. Ensure the output is valid JSON.
           
           JSON Content:
           {content}";
}
