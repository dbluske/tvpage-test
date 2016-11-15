# THE BLUSKE DEV TEST

## Scraping pages & aggragating URLs by domain

### MongoDB 
used to store sessions and anonymous user data

### Express 
used for API to route URL requests to the web scraper

### AngularJS, Bootstrap, D3, and jQuery 
used for async data exchange and view updating
 
Project Duration: 3 days

Working app:  [www.vitalreplica.com/tvpage-test](http://www.vitalreplica.com/tvpage-test)

---

ACCOMPLISHED:

  * listed domains found for URL provided
  * listed urls per each domain
  * created dynamic histogram of URL counts per domain
  * SPA functionality implemented for async processsing (with friendly cat loading button)
  * query results queued -- which can be removed with **x**
  * Cookie stored in DB allows for recent query suggestions

TODOS + ROOM FOR IMPROVEMENT:

  1. rollover and select of recent search suggestions
  2. auto adding "http" or "https" prefix to generic input for _www.something.com_
  3. onclick handling in the histogram

