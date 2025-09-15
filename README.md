# Liberty Lens - News Analysis Platform TODO List:

1. ✅ Manually assess functionality of Landing Page (links, navigation, etc.)
2. Refine pagination for Articles fetched for a feed. Seems like it spreads provided "limit" across a different call to each source (getArticlesBySource). Is there a way to model this better in the data or use an abstraction from electro to be more performant?
3. Resolve why just 3 sources are getting counted as success in cron job runs for hydrating initial 8 sources of articles.
4. set TTL for articles in general; maybe start with 7 days for all articles put in via the daily cron.
5. add dynamo stream to start creating data sheet per user for the dashboard page (articles analyzed? read? time saved? etc.)
6. Revise styling for Login page.
7. Modify feed from feed card. enables adding/removing sources as desired.
8. Brainstorm the "ai analysis" level when feed created. This might not be viable as it implies we analyze every damn article in a feed.
9. Develop "analyze article" functionality. go with claude api+mcp enabled to 1. mcp fetch page content from URL then 2. submit to api in actual prompt for analysis.
10. CRUD operations for analyses: once submitted, perhaps deferredCompletion API with push notification for when analysis is done (when done, it is obviously saved for user so they can fetch on analyses page).
11. Biome quality check issues.
12. CICD well formed so we deploy to prod.
13. Add your own source from RSS.
14. Critically brainstorm if it makes more sense to somehow "consume" news sources (from RSS feeds) in place and just display their articles versus manually saving all the articles and incurring that data complexity and cost. If we can just consume in place, a user can always have access to the sources and click "refresh" whenever they want; that wont incur any cost for me other than an API call basically and will be simpler.
15. can still do a batch process each night that grabs top articles, TEMPORARILY saves their content and creates summaries and metrics and
16. marketing: spend 70 bucks on a few ads and get fuckin' grinding.
