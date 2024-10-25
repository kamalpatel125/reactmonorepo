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
