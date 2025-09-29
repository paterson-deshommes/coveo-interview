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


## Release 2: Add logging and improve security

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

## Releasee 3: Add versioning, improve error handling, update Contnt-Type and HTTP metod supported.

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
