# Suggested Improvements

## Features

- Support searching through multiple pages.
  The code only support showing the results from the first page right now.
- Allow users to specify latitude and longitude.
- Internationalization of cities' name (french or english).
  - Support displaying the french or english name of the cities (based on user choice).

## Maintainability

- Put backend url in environment variable.
  - The url would vary per environment (dev, qa, prod) so it would be better to set in an environment variable rather than
    hardcoding it.