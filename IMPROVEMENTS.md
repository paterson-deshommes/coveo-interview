# Suggested Improvements

## Release 1: Improve testability

### Frontend

- Add jest tests for the different components (ResultList, SearchBar).
- Add cypress tests that both mock the backend api call and also issue real call to test frontend & backend integrations.
- Put backend url in environment variable.
  - The url would vary per environment (dev, qa, prod) so it would be better to set in an environment variable rather than
    hardcoding it.

### Backend

- Rename SuggestionsResource tests appropriately.
  - Current tests for SuggestionsResource follow the naming convention *testSuggestionEndpoint1*,
    *testSuggestionEndpoint2*, etc. This does not tell us at all what is being tested and what are
    we expecting. The test name should reflect the expected behavior given a set of conditions 
    (e.g: testReturnEmptyResultWhenThereIsNoMatch)
- Make SuggestionsResource tests independent of CsvParser or independent from the real data file.
  - Right now the test use the real CsvParser which uses the real cities_canada-usa.tsv file.   
    It requires the tester to know about what data is actually in the file, in order to do some testing. It would be better to allow us to either inject our own MockCsvParser that returns mock data or use the real CsvParser but define in the test which file it should use.
- Add a test class for CsvParser.
  - Right now, the CsvParser is tested through the SuggestionResource test class. This is done through
    the use cases of SuggestionResource. It would be better to have a CsvParser test that really tests
    all the behaviors of the CsvParser.
- Add end-to-end tests.
  - We do not have any end-to-end tests (send an http request that goes through the middlewares, hit
    the controller, execute the business logic, returns a http response). We should add some to test
    our business use cases.


## Release 2: Improve security & observability in backend, allow frontend to use latitude and longitude

### Frontend
- Allow users to specify latitude and longitude.

### Backend

- Add proper logging.
  - Right now, we are writing log to the console only. It would be good to change the code to allow
    many different log destination (console, file, event log, sentry, splunk, application insights) depending on the environment (dev, qa, prod).
- Update the CORS rule on the endpoint.
  - The /suggestions endpoint allow any domain in the browser to use javascript to fetch data from
    our endpoint. Is that what we want in practice? Is the API supposed to be public or is it
    an internal api where the frontend is the public interface? In that case, we should probably change our CORS rule to the domain of the frontend app. We might want to use an environment variable that could have different values depending on whether we are running it on a dev environment, qa or prod. If the api is public, we can leave it as is especially since we are not serving sensitive data.
- Add authentication & authorization (optional)
  - If the API is supposed to be called only by some services or some users, then we should add an authentication and authorization mechanism (maybe API key or JWT for users and JWT or mTLS for services).
- Add rate limiting to the endpoint.
  - By IP address if the API is public or if we just don't care who access it. If the API is private and should be called only
    by some specific services or users.
- Add in-app metrics.
  - time spent for query lookup
  - time spent for geo localization lookup
  - time spent for serialization
  - cache efficiency (cache hit, cache miss)
- Add Spring Boot Actuator to monitor system health.
  - The endpoint should not be accessible to public users and maybe protected with specific security role.

## Release 3: Add versioning, improve error handling, update Content-Type and HTTP metod supported.

### Backend

- Add versioning.
  - The api does not support version right now. As we add new features, it would be necessary to have it.
- Improve error response when parameter q is not provided.
  - HTTP response is a 400 Bad Request but it doesn't say what the error is. We should add an error message parameter
    that describes that the parameter q is mandatory.
- Log csv parsing error.
  - CsvParser print the stack trace if there's an error while reading the data file. As mentioned
    before, logs should be configurable (different log destination depending on environment).
- Return HTTP 500 Server Error if we fail to read the csv file
  - If CsvParser fails to read the file, it returns an empty hashMap which cause the endpoint
     return a 200 OK response with an empty result. I feel it is misleading since an error actually 
    occured and we have no way to know it and the app gives the impression that everything worked 
    fine and that there were just no cities matching the user query. The endpoint should return a 500
    so that a monitoring tool can pick up the issue. The user should also know an error occured.
- Add proper input validation and return 400 Bad Request when there's a violation.
  - The parameter **q** should not accept numbers, latitude and longitude both valid ranges that we 
    can validate, page should not be less than 0 or higher than MAX_PAGE. Right now, the code will
    pretty much just return an empty result but we can provide a more useful message to the user so
    that they understand how to use the api.
- Log and throw an error if csv file is read and parsed correctly but the city hashMap is empty.
  - Right now, the code will execute correctly if the data file is read and parsed correctly but it 
  contains nothing. Having an empty file is probably not something we want so we should throw an error
  so that we can notify of that issue and potentially prevent the app from initializing.
- Only allow HTTP method GET.
  - Right now, the endpoint accepts any HTTP method. Using POST, PUT, DELETE will yield the same result. We should change that to only support GET.
- Change Content type from plain/text to application/json.
  - The endpoint currently returns a text/plain response, even though the string is an actual json object.
    According to RFC 8259, JSON responses should be served with application/json. Moreover, it may break third
    party integrations that expect the proper MIME type or APIs that use the ACCEPT header may fail if the response is
    not application/json.


## Release 4: Improve code design & performance

### Backend

- Remove unused city fields.
  - Our city object has a lot of fields that are not currently being used. Do we really need them?
    Can we get rid of them? Subsequently, do we need them in the **cities_canada-usa.tsv** file?
- Move controller logic to a service class.
  - The controller logic should be in a service class. That way, we could reuse the logic from different interface (HTTP api, RPC api, CLI, Message Queue).
- Create a more generic CityRepository and make CsvParser an implementation details.
  - CsvParser is very implementation-oriented and does not need to be used directly. We could have
    a more generic CityRepository which reads data from **cities_canada-usa.tsv** and uses CsvParser
    to get a HashMap of cities. That way, if we want to change the implementation at some point, it 
    will be localized inside the repository.
- Move filtering logic inside CityRepository class.
  - The filtering logic is pretty much something we find in database (e.g: LIKE %<some-string>% WHERE latitude > <some-value>) so it would makes sense to have that logic directly in the CityRepository class.
- Load cities data in-memory only once.
  - The file **cities_canada-usa.tsv** is read in-memory everytime the endpoint is called. The file
  size is 1.1 MB. We could improve performance by only reading the fil in-memory once, either the
  first time the endpoint is called (lazy initialization) or on the app startup.
- Add support for browser caching.
  - The endpoint currently does not allow for browser caching on url query string. If a client send multiple times the same   request, we will process the request each time. If we add support for caching, the browser will cache the result for a given time priod and we won't have to reprocess it. By browser caching support, we mean
  ETag and Cache-Control.
- Add support for server caching.
  - We could use in-memory cache using the query, latitude and longitude as key to avoid searching through the data everytime.
    We could force cache eviction of all data when the data source change, otherwise just keep the data in the cache.


## Release 5: Small features update + decoupling from data source

### Frontend

- Support searching through multiple pages.
  The code only support showing the results from the first page right now.

### Backend

- Make page 1-based.
  - Page is currently 0-based. The first page is page 0 and the last page is totalNumberOfPages - 1.
    I found that to be a bit weird for a paging system, I feel it would be better for the first page
    to be 1 and the last page to be be totalNumberOfPages.
- Allow users to specify latitude and longitude precision.
  - Right now, latitude and longitude precision is hardcoded. It would be nice to make these default
    values but to allow to user to pass the precision they want.
- Separate the data source from the application.
  - The file **cities_canada-usa.tsv** currently lives with the application. That means that    
    updating it requires updating the application. We could put the file in a blob storage or a
    S3 bucket. That way we could update it without touching the application. We could also add a webhook
    in the application to be notified when the file changes so that it reloads in-memory. The file is unlikely
    to change often.
- Do not provide default value for latitude/longitude.
  - Because of the default values, not all possible values are returned. Because of that, we do not support 
    the use case where a user wants to find all canadian and american cities matching the query "mont". To support
    that use case, we should remove the default value latitude/longitude and just returned all matched values if
    these parameters are not provided.
- Add page size.
  - Allow user to specify page size in query and support a default value.


## Release 6: Support french city name, country filtering, case-insensitive search

### Frontend
- i18n of cities' name (french or english).
  - Support displaying the french or english name of the cities (based on user choice).

### Backend

- Support case-insensitive search.
- Add country filtering.
  - Search only in Canada or only in the US. Returns an error for some other country.
- Add support for French characters.
  - The API does not seem to support search for cities like "Montréal" or "Québec".


## Release 7: Support prefix match and ranking

### Backend

- Add ranking.
  - Depending on what we think would be most valuable to user, the response could be ranked based on population size,
    closeness to latitude/longitude, exact match followed by prefix match or substring match, maybe ordered alphabetically.
    We could also allow the user to pass in a parameter that determins the ranking. Not sure how useful that would be, we could
    see if there's an actual user needs for that.
- Support prefix match.
  - Would probably require using a trie data structure for efficient searching.


## Release 8: Suport fuzzy search & add GraphQL endpoint

### Backend

- Support fuzzy search.
  - Allow users to still find matching cities even in the presence of typos or mispelling.
- Add a GraphQL endpoint to retrieve subset of data.
  - Looking at how the data is used in the frontend, we could return only a subset of the data instead of the whole city object.
