# Suggested Improvements

## Features

- Make page 1-based.
  - Page is currently 0-based. The first page is page 0 and the last page is totalNumberOfPages - 1.
    I found that to be a bit weird for a paging system, I feel it would be better for the first page
    to be 1 and the last page to be be totalNumberOfPages.
- Allow users to specify latitude and longitude precision.
  - Right now, latitude and longitude precision is hardcoded. It would be nice to make these default
    values but to allow to user to pass the precision they want. 



## Security

- Update the CORS rule on the endpoint.
  - The /suggestions endpoint allow any domain in the browser to use javascript to fetch data from
    our endpoint. Is that what we want in practice? Is the API supposed to be public or is it
    an internal api where the frontend is the public interface? In that case, we should probably change our CORS rule to the domain of the frontend app. We might want to use an environment variable that could have different values depending on whether we are running it on a dev environment, qa or prod. If the api is public, we can leave it as is especially since we are not serving sensitive data.
- Add proper logging.
  - Right now, we are writing log to the console only. It would be good to change the code to allow
    many different log destination (console, file, event log, sentry, splunk, application insights) depending on the environment (dev, qa, prod).

## Performance

- Load cities data in-memory only once.
  - The file **cities_canada-usa.tsv** is read in-memory everytime the endpoint is called. The file
  size is 1.1 MB. We could improve performance by only reading the fil in-memory once, either the
  first time the endpoint is called (lazy initialization) or on the app startup.

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

## Code Design

- Remove unused city fields.
  - Our city object has a lot of fields that are not currently being used. Do we really need them?
    Can we get rid of them? Subsequently, do we need them in the **cities_canada-usa.tsv** file?
- Only allow HTTP method GET.
  - Right now, the endpoint accepts any HTTP method. Using POST, PUT, DELETE will yield the same result. We should change that to only support GET.
- Move controller logic to a service class.
  - The controller logic should be in a service class. That way, we could reuse the logic from different interface (HTTP api, RPC api, CLI, Message Queue).
- Create a more generic CityRepository and make CsvParser an implementation details.
  - CsvParser is very implementation-oriented and does not need to be used directly. We could have
    a more generic CityRepository which reads data from **cities_canada-usa.tsv** and uses CsvParser
    to get a HashMap of cities. That way, if we want to change the implementation at some point, it 
    will be localized inside the repository.
- Move filtering logic inside CityRepository class.
  - The filtering logic is pretty much something we find in database (e.g: LIKE %<some-string>% WHERE latitude > <some-value>) so it would makes sense to have that logic directly in the CityRepository class.




## Error Handling

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


## Testability

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

