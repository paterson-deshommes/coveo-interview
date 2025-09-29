# Suggested Improvements

## Features

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
- Support fuzzy search.
  - Allow users to still find matching cities even in the presence of typos or mispelling.
- Support case-insensitive search.
- Add country filtering.
  - Search only in Canada or only in the US. Returns an error for some other country.
- Support prefix match.
  - Would probably require using a trie data structure for efficient searching.
- Add ranking.
  - Depending on what we think would be most valuable to user, the response could be ranked based on population size,
    closeness to latitude/longitude, exact match followed by prefix match or substring match, maybe ordered alphabetically.
    We could also allow the user to pass in a parameter that determins the ranking. Not sure how useful that would be, we could
    see if there's an actual user needs for that.
- Add page size.
  - Allow user to specify page size in query and support a default value.
- Add a GraphQL endpoint to retrieve subset of data.
  - Looking at how the data is used in the frontend, we could return only a subset of the data instead of the whole city object.
- Add support for French characters.
  - The API does not seem to support search for cities like "Montréal" or "Québec". 


## Observability
- Add in-app metrics.
  - time spent for query lookup
  - time spent for geo localization lookup
  - time spent for serialization
  - cache efficiency (cache hit, cache miss)
- Add Spring Boot Actuator to monitor system health.
  - The endpoint should not be accessible to public users and maybe protected with specific security role.


## Performance

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


### Lazy Initialization

```java
@Repository
public class FileRepository {

    private List<String> data;

    public List<String> getData() {
        if (data == null) {
            loadFile();
        }
        return data;
    }

    private synchronized void loadFile() {
        if (data == null) { // double-check
            // read file logic
            data = ...;
        }
    }
}
```

### On App Startup

```java
@Repository
public class FileRepository {

    private List<String> data;

    @PostConstruct
    public void init() {
        loadFile();
    }

    private void loadFile() {
        data = ... // read file logic
    }

    public List<String> getData() {
        return data;
    }
}
```

## Design

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






