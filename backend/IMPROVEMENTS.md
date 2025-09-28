# Notes/Questions

- The /suggestions endpoint allow any domain in the browser to use javascript to fetch data from
  our endpoint (CORS *). Is that what we want in practice? Is the API supposed to be public or is it
  an internal api where the frontend is the public interface? In that case, we should probably change
  our CORS rule to the domain of the frontend app. We might want to use an environment variable that
  could have different values depending on whether we are running it on a dev environment, qa or prod.
  If the api is public, we can leave it as is especially since we are not serving sensitive data.
- Right now, we are writing log to the console only. It would be good to change the code to allow
  many different log destination (console, file, event log, sentry, splunk, application insights) depending on the environment (dev, qa, prod).
- The file **cities_canada-usa.tsv** is read in-memory everytime the endpoint is called. The file
size is 1.1 MB. We could improve performance by only reading the fil in-memory once, either the
first time the endpoint is called (lazy initialization) or on the app startup.
- Our city object has a lot of fields that are not currently being used. Do we really need them?
  Can we get rid of them? Subsequently, do we need them in the **cities_canada-usa.tsv** file?
- CsvParser print the stack trace if there's an error while reading the data file. As mentioned
  before, logs should be configurable (different log destination depending on environment).
- If CsvParser fails to read the file, it returns an empty hashMap which cause the endpoint
  to return a 200 OK response with an empty result. I feel it is misleading since an error actually 
  occured and we have no way to know it and the app gives the impression that everything worked 
  fine and that there were just no cities matching the user query. The endpoint should return a 500
  so that a monitoring tool can pick up the issue. The user should also know an error occured.

## Lazy Initialization

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

## On App Startup

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

