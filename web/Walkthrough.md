### If you are new to Vue / Nuxt

We suggest you to learn Vue 3 (Composition API) first before proceeding. See [docs](https://vuejs.org/guide/introduction.html).

After you are familiar with Vue, you can proceed with learning [Nuxt 3](https://nuxt.com/).

# Project Structure Walkthrough

This repo will be use for mulitple merchants. Therefore you will see extra folders compared to normal Nuxt 3 strucutre.

## Merchant's Configuration

In `/merchant_config/[merchant_name]` folder, we define the configuration for different merchants in JS, for 3 environments dev, stage and prod.

To run a merchant's site, use `npm run {dev/deploy} --project={merchant} --env={environment}`

The file you selected from your npm command will be imported into `nuxt.config.js` to build the server.

- runtimeConfig - Similar to [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)

- i18n - The configuration for [Nuxt i18n](https://v8.i18n.nuxtjs.org/getting-started/setup)

- feTemplate - The components' template to be used. The numbers correspond to the folder name in `/merchant_components`.

## Merchant's Components

Different merchants might have different UI / flow on some pages. All the different components will be put under `/merchant_components`. We define which components to be used in the configurations JS mentioned above (under `feTemplate`).

`feTemplate` will be picked up by `/modules/templates.js` which injects the components into our build.

### Why use module?

We could have put everything inside `/components` folder and render them using `v-if` based on different merchant. However, this approach will include all the components into the final build, even if they're not being used during runtime, increasing the size of the built files.

To overcome this issue, we use module to inject only the components that we need.

## Merchant's Theme

CSS for different merchants is in `/assets/[merchant_name]`.

## API

Files Invovled: 

- Merchant's config file (dev.js || stage.js || prod.js)
- `/plugins/api`
- `/server/api/[scope]/[action].post.js` 
- `/server/apiRoutes/routes.js`
- `/server/helper/call.js`

## How it work
###  `/plugins/api`

In a Nuxt.js application, a client-side `$api` function is designed to handle API requests. A Nuxt plugin is created by importing the `cache` object from a local module and initializing variables such as user data, locale path, and route using Nuxt context. The core of this plugin is an asynchronous `api` function for making API requests. If a `cacheKey` is provided, it checks and initializes a cache, improving data retrieval efficiency. It can retrieve cached data with the provided key. Additionally, this plugin accesses language and device information from the Nuxt app, sets up request options like method, body, and headers, sends POST requests to the API endpoint, and handles any potential errors. If a `cacheKey` is provided, it stores the API response in the cache. Ultimately, this plugin offers the `api` function to the Nuxt.js application context, streamlining API request handling with caching.

-  `$api`  function is only meant to be called on client side.
- Import the `cache` object from a local module. Export a Nuxt.js plugin function.  Initialize variables for user, locale path, and route using Nuxt.js context.
- Define an asynchronous `api` function for making API requests.
- If a `cacheKey` is provided, check and initialize the cache.
- Check if data exists in the cache with the provided key, and return it if found.
- Access language and device information from the Nuxt app.
- Set up request options including method, body, and headers.
- Send a POST request to the API endpoint and handle errors.
- If a `cacheKey` is provided, store the API response in the cache.
- Provide the `api` function to the Nuxt.js application context.

### `/server/api/[scope]/[action].post.js`

 The post api request starts by creating a whitelist of accepted origins based on configuration settings for domains, protocols, and subdomains. Incoming requests are checked against this whitelist. If the request is from an allowed origin, it proceeds to route handling. The code tries to match the requested route with predefined routes and executes the associated function if it exists. If successful, it returns the result otherwise, it logs errors and sends appropriate HTTP responses for unauthorized origins or invalid routes.

- Import the `routes` module from `../../apiRoutes/routes`.
- This api  is meant to post api request on server side with path params `scope and action`
- Fetch confited guration settings using `useRuntimeConfig()`.
- Initialize `domains` array from `config.DOMAINS` (comma-separated values).
- Define `protocols` array with 'http' and 'https'.
- Create `subdomains` array with empty string and 'www.'.
- Add subdomains from `config.SUBDOMAINS` (if present).
- Generate `whitelist` array combining protocols, subdomains, and domains.
- Define `isWhitelist` function to validate request origin.
- Check if `event.node.req.headers.origin` is in the `whitelist`.
- Export a function as the event handler using `defineEventHkandandler(event)`. 
- Verify if the request's origin is whitelisted using `isWhitelist`.
- If not whitelisted, set a 403 status and respond 'Not allowed by CORS'.
- Check if requested route and action exist in `routes`.
- If found, execute the corresponding function with `event` parameter.
- Handle successful execution or errors:
    - Return the result if successful.
    - Log and return a server error message if there's an error.
- If route or action not found, set a 404 status and respond 'Not Found'.

### `/server/apiRoutes/routes.js`

In `/server/apiRoutes/routes.js` defines a modular API handling system using the `routes` object. It organizes various API endpoints and their corresponding functions for a web application. Each function in the `routes` object makes HTTP requests to specific API endpoints using the `_post` function. Notable features include user authentication, session management, and API calls for user registration, financial transactions, referrals, promotions. This is exportable for use in different parts of the application, enabling interaction with the specified API endpoints by passing data via an 'event' parameter.
 
- In  `/server/apiRoutes/routes.js`   imports various functions and modules from `../helper/call` and `../helper/utils` to handle HTTP requests and data encoding/decoding.
- The Function defines an object named `routes` that contains categories of API request functions.
- Each category has multiple sub-functions for specific API endpoints, such as 'user,' 'deposit,' 'withdraw,' and more.
- To make an API request, call the relevant function from the `routes` object, passing the `event` parameter as the request data.
- Handling responses functions within each category use the `_post` function from `../helper/call` to make actual HTTP requests.
- After receiving a response, the code may take actions based on the response data.
- Some functions have error handling using `try`, `catch`, and `finally` blocks.
- In the `logout` function, it catches errors that occur during the API request and ensures that the 'status' property of the response is set to 'true' in the `finally` block.
- The `user/session` function manages user sessions.
- It attempts to retrieve user information from a cookie and checks if the user is logged in by verifying the presence of 'uid' and 'token' in the stored user data.
- The `routes` object is exported as the default export of the module, making it accessible to other parts of the application.
- To use this, import the `routes` object and call the relevant functions to interact with your API endpoints. Ensure you have the necessary dependencies and set up your environment to handle HTTP requests and cookies as required .

### `/server/helper/call.js`

This functions are for interacting with an API. It includes functions for making GET, POST, PUT, and DELETE requests to the API. These functions construct request headers, handle request body data, and serialize it into a query string. The configuration object for API settings and captures various information from the request, such as IP addresses, user agents, and cookies. In case of errors during the API request, the code logs relevant information and sends notifications to Slack.It abstracts away many of the complexities of making API requests, making it easier to work with a specific API while providing error handling.

- The `/server/helper/call.js` starts by importing two functions.
- it retrieves some configuration values using the `useRuntimeConfig` function and stores them in the `config` constant.
- The `call` function is the core. This function is defined as an asynchronous function that takes an object with three properties: `method`, `path`, and `event`.
- Inside the `call` function, headers for the API request are constructed. These headers include various information like authorization keys, IP address, user-agent, and more.
- The Handle cookies checks for and extracts specific cookies, such as "fb_dynamic_pixel" and "afUserId," and includes them in the request headers if they are present.
- The request parameters are constructed based on the event and configuration. It includes the `merchant_id` and, if a user is logged in, their `uid` and `token`.
- The request URL is constructed using the API domain from the configuration (`config.API_DOMAIN`), the path provided as an argument, and the query parameters formed from the request body.
- If the request body includes a `force_user_agent` value, it is used as the user-agent in the request headers.
- The actual API request is made using the `fetch` function (or an equivalent library like `$fetch`). The URL and fetch options (including method and headers) are passed as arguments.
- If the API request encounters an error (either a network error or a response with a non-successful status code), the code handles the error. It logs information about the error and sends notifications to Slack, including details such as the URL, headers, and parameters used in the request.
- Finally, it exports four functions: `_get`, `_post`, `_put`, and `_delete`. These functions are essentially wrappers around the `call` function, simplifying the process of making GET, POST, PUT, and DELETE requests to the API. They take a `path` and an `event` and specify the HTTP method for the request.


## User Log In & Session

Files Involved:
- `/store/user.js/`
- `/server/apiRoutes/routes.js`
- `/server/helper/utils.js`
- `/plugins/auth.server.js`

### How it works

### User Authentication (Login)

- When a user attempts to log in, the `login` function in the `User Management Store` is called. It validates user input and communicates with the `userStore` to handle the login process .

- The `userStore.login` function sends a request to the `index/auth`" endpoint on the server to authenticate the user in `routes.js`  .

- If the authentication is successful, then the  response  is stored in `cookie` by encoding the user's information using `JSON.stringify` and `encode` functions. After this the response is stored `userStore`  by  deleting the token from the response in state `data`. See the `login` function in `/api/routes/routes.js` 

- The user is marked as logged in, and their data is stored within the application for further use. See the function in `userStore.login`

### User Logout

- When a user decides to log out, the `logout` function in the "User Management Store" is called .

- This function triggers the `userStore.logout` method, which sends an HTTP POST request to the `index/logout` endpoint on the server. See the `logout` function in `/apiRoutes/routes.js`.

- If the logout request is successful, the user's `cookie` and data stored in `userStore` is removed , effectively logging the user out and navigates the user to `redirectUrl`.

- Additionally, the user data within the application is reset, and the user can be redirected to a specified URL upon logout .See the function in `userStore.logout`


### `/plugins/auth.server.js`

- It checks if the `storedUserCookie.value` is truthy

- It attempts to parse the content of the "user" cookie using JSON.parse and the decode function to decode the Base64-encoded content. If parsing fails, it catches any errors (likely due to invalid or corrupted data).

- If a user is logged in and if user data exist and data contains `uid` and `token` it calls the `userStore.setUser(user)` function to set the user data in the application's user store. This action likely logs the user in and makes their data accessible throughout the application (e.g. It will try to read the cookie and decodes it to get user's information. If user information is valid, it will store into `/store/user.js`).

  - As it is a plugin it will execute only when
    - When the user refresh the page

    - When the user goes to a page by entering URL in the browser's address bar

### `/middleware/auth.js` - For pages that requires login

1.  `/middleware/auth.js` checks if the user is not logged in by examining the `user.loggedIn` property.
    
2.  If the user is not logged in, it redirects will to the root route of the application by `navigateTo`.

```js
export default {
   definePageMeta({
     middleware: ['auth']
})
}
```

## SEO

Files Involved:

- Merchant's config file (dev.js || stage.js || prod.js)

1. **`/plugins/seo.server.js`**:

   - This plugin runs on the server side (e.g., when the user refreshes the page).
   - It initializes an `seoCache` to store SEO data and its expiration timestamp.
   - It accesses the `seoStore` for SEO-related data and the runtime configuration (`config`).
   - It attempts to retrieve the current URL and sets the `seoStore.domain` with the URL's origin.
   - It checks if cached SEO data is expired. If expired or not available, it fetches SEO data from the URL specified in `config.SEO_JSON`.
   - If data is fetched successfully, it updates `seoCache.data` with the new data and sets a new `expiry` time (usually 1 hour into the future).
   - Any errors during the fetching process are caught but not acted upon.
   - Finally, it updates the SEO store with the data from `seoCache`.

2. **`app.vue`**:

   - The `app.vue` component is initially rendered.
   - SEO-related data is then rendered, including title, description, and keywords.
   - It uses the `seoStore` to match the current route's path and extract relevant SEO information.
   - Metadata properties (e.g., title, description, keywords) are populated based on the matched SEO data.
   - The code checks if the page's domain matches any domain in the `NO_INDEX_DOMAIN` configuration from the `seoStore`. If there's a match, it sets metadata to indicate whether the page should be indexed or not.

3. **`/server/middleware/robots.js`**:

   - This middleware handles requests for `robots.txt`.
   - It uses the `useRuntimeConfig` function to access runtime configuration settings.
   - It extracts information about the incoming request, such as the `pathname` and `origin`.
   - It checks if the request method is a GET request and if the requested path is '/robots.txt'.
   - In a production environment, it checks if the request's origin matches any of the domains listed in `config.public.NO_INDEX_DOMAIN`. If there's no match, it allows user-agents to index all pages; otherwise, it disallows indexing the site.

4. **`/server/middleware/sitemap.js`**:

   - This middleware handles requests for `sitemap.xml`.
   - It accesses runtime configuration settings and determines the environment.
   - It initializes data structures for currencies and providers.
   - It extracts information about the incoming request.
   - It checks if the request method is a GET request and if the requested path is '/sitemap.xml'.
   - It fetches provider data for various currencies if it hasn't been obtained yet.
   - It generates an XML sitemap for various pages, locales, currencies, and provider categories.
   - The generated sitemap XML is returned as the response.


## Games

  
Files Involved:

- Merchant's config file (dev.js || stage.js || prod.js)

-  `app.vue`

-  `/store/provider.js`

-  `/store/games.js`

-  `/store/dashboard.js`

- Any games page (e.g. `/pages/slot/[provider].vue`)

### `getJSON()` Function

The `getJSON()` function is a crucial part of our application. It's responsible for fetching data from a given URL and caching it for future use. Here's a detailed walkthrough of how it works:`

1.  **Function Arguments**: The `getJSON()` function accepts two arguments: `url` and `cacheKey`. The `url` is the API endpoint from which the data is fetched, and `cacheKey` is the key under which the data is stored in the cache.

2.  **Browser Support for IndexedDB**: The function first checks if the browser supports IndexedDB, which is a low-level API for client-side storage of significant amounts of structured data.

- If IndexedDB is not supported by the browser, the function will call the API using the given URL and store the data in a state only.

- If IndexedDB is supported, the function will check if the `cacheKey` has non-expired data.

- If the data exists, the data will be updated to the state.

- If the data does not exist or is expired, the function will call the API, update the state with the fetched data, and also store the data in IndexedDB for future use.

### How it works:

### `/store/provider.js`

1.  **Rendering the `app.vue` component**: When a user navigates to a games page, the `app.vue` component is rendered. This is the main Vue component where the games are displayed.

2.  **Dispatching the fetch action**: The `app.vue` component dispatches an `getProviders` action to the `provider.js` on mount. Pinia store module to fetch the necessary data. This action is responsible for making the API call to fetch the list of game providers.

3.  **Fetching the providers**: The `provider.js` pinia store module runs a function [`getJSON()`](#getjson-function) to fetch the list of game providers. The API call hits our backend at AWS s3, which returns the list of game providers.

4.  **Storing the providers**: Once the data is fetched, it is stored in the Pinia store. The `provider.js` Pinia store module has a state variable that holds the list providers. This state is updated with the country will change it will hit `getProviders` in `provider.js` and update list of games by kicking `setProviders` in `provider.js`.

5.  **Displaying the providers**: The games pages (e.g., `/pages/slot/[provider]vue`) use the data from the pinia store to display the games from the respective providers. These pages access the state of the `providers` pinia store to get the list of game providers and display the games accordingly.

6.  **Store update**: In `app.vue` watch function is added to keep watching `country` change, when country changes it will hit `getProviders` in `provider.js` and update list of games by kicking `setProviders` in `provider.js`.

### `/store/games.js`

1.  **Start Play Game**: In `app.vue` when clicked on `Play Now` then the `gamesStore.playGame` action will get dispatch in `store/games.js`. 
2. **Dispatching the fetch action**: When play now get hit and will dispatch `gamesStore.playGame` . Which will be responsible for validation such as (game is in maintenance, user logged in, version chosen, etc.). If passed all validation, then dispatch `mainStore.loadingGame  =  true` and hit the API at the backend.
3. **API Fetching**: `playGame` dispatches `/game/login-game` API at the backend.
	 - If the response `status ` or `data.auto_status` not available then quit the model. 
	 - Else  it will hit `game/auto-transfer` API at backend. If the response `status` not available then quit the model.
	 -  else `mainStore.loadingGame  =  true` and redirect to the game URL.
4. And you are on the  game page ready to load game.

### `/store/dashboard.js`

  

1.  **Rendering the `app.vue` component**: When a user entres, the `app.vue` component is rendered. This is the main Vue component where each comes in action.

  

2.  **Dispatching the `init()` action forced on mount**: When the `app.vue` is rendered. On mount the `dashboardStore().init(true)` . The true parameter specify forcefully init the fetch request.

	- It will hit `user/dashboardv2` to check if the home page is available.

	- If home page not available will return and data will not be loaded.

	- else then it will check for logged-in or not

	- if logged-in then it will set `previousDataIsLoggedIn` state `true` and update `userStore` data.

	- else set `previousDataIsLoggedIn` state `false` and reset `userStore` data.

3.  ***Dispatching the `init()` action in `app.vue` by watcher**: In `app.vue` watcher is keeping eye on following changes.

	- watcher on `userStore.loggedIn` will hit `init()` action in `dashboardStore` if user is logging in or out. If user is previously logged-in then, if user haven't called in previous 30 seconds then it will update call numbers by 1.

	- watcher on `locale.value` will hit `init(true)` action in `dashboardStore` with force parameter as `true`. where `locale` refers to language selected.

  
  

4.  **Get game provider list under maintenance**: If the response data contains provider maintenance information is of type array then `dashboard.maintenance` state will be updated by the list of providers in maintenance.

5.  **Games in maintenance**: In `GameContainer.vue` when there is game provider is in maintenance then the game cards will not be clickable and there you will have message `maintenance_start_date to maintenance_end_date` and `provider_name` displayed for user's acknowledgement.

  

### *Games Pages*

- In pages all games pages have similar mechanism. So, let's get into one `/pages/slot` .

  

### `/pages/slot/index.vue`

  

1.  **Rendering**:After getting redirected to respective game page, the game page load inside of `home layout`.

	- By `index.vue` there will be a `MarqueeAnnounce` component that contains the the announcement message.

	- There is a loading skeleton which will be visible only if `bannerStore.ready` is false, that is banner loading.

  

2.  **watcher**:

	- A watcher named `readyWatcher` is defined using `watchEffect`. It monitors changes in the `providerStore`, `userStore`, and `dashboardStore`, and when conditions are met, it triggers the `getGames('slot')` method.

	- watch function watches `userStore.loggedIn` changes, will triggers the `gamesStore.getGames('slot')` method, which likely fetches or updates game-related data for the **slot** type.

4.  **Play Action**: The Games card rendered from `GameContainer` component will contain the **Play Now** button, and when clicked, it will redirect to play game .

Now, the user can play the game.

  

When user select any provide in `GameContainer` component's provider tab, then get redirected to respective`/pages/slot/[provider].vue`

  

### `/pages/slot/[provider].vue`

  

This will have same function as in [`index.vue`](#pagesslotindex.vue) but will have filtered games by provider name.