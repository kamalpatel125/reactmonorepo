using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using System;
using System.Web;

public class SensitiveDataFilter : ITelemetryInitializer
{
    public void Initialize(ITelemetry telemetry)
    {
        if (telemetry is RequestTelemetry requestTelemetry && requestTelemetry.Url != null)
        {
            // Replace sensitive data in query strings
            var uriBuilder = new UriBuilder(requestTelemetry.Url);
            var query = HttpUtility.ParseQueryString(uriBuilder.Query);
            
            // Replace or remove sensitive parameters, e.g., "password"
            if (query["sensitiveParam"] != null)
            {
                query["sensitiveParam"] = "REDACTED";
            }
            
            uriBuilder.Query = query.ToString();
            requestTelemetry.Url = uriBuilder.Uri;
        }
    }
}

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddApplicationInsightsTelemetry();
        services.AddSingleton<ITelemetryInitializer, SensitiveDataFilter>();
    }
}


const activeRequests = new Map();

async function fetchWithCancellation(endpoint, options = {}) {
  // If there's already an active request for the endpoint, cancel it
  if (activeRequests.has(endpoint)) {
    activeRequests.get(endpoint).abortController.abort();
  }

  // Create a new AbortController for the new request
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Store the new AbortController in the activeRequests Map
  activeRequests.set(endpoint, { abortController });

  try {
    // Make the fetch request
    const response = await fetch(endpoint, {
      ...options,
      signal,
    });

    // Remove the entry from the Map after a successful fetch
    activeRequests.delete(endpoint);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;

  } catch (error) {
    // Check if the error is due to an aborted request
    if (error.name === 'AbortError') {
      console.log(`Request to ${endpoint} was cancelled`);
    } else {
      console.error(`Fetch error: ${error.message}`);
    }

    // Clean up if there's an error
    activeRequests.delete(endpoint);
    throw error;
  }
}
