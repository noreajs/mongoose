export default class HttpStatus {
    /**
     * 1xx Informational response
     */
    static Continue: 100 = 100;
    static SwitchingProtocols: 101 = 101;
    static Processing: 102 = 102;
    static EarlyHints: 103 = 103;

    /**
     * 2xx Success
     */
    static Ok: 200 = 200;
    static Created: 201 = 201;
    static Accepted: 202 = 202;
    static NonAuthoritativeInformation: 203 = 203;
    static NoContent: 204 = 204;
    static ResetContent: 205 = 205;
    static PartialContent: 206 = 206;
    static MultiStatus: 207 = 207;
    static AlreadyReported: 208 = 208;
    static IMUsed: 226 = 226;

    /**
     * 3xx Redirection
     */
    static MultipleChoices: 300 = 300;
    static MovedPermanently: 301 = 301;
    static Found: 302 = 302;
    static SeeOther: 303 = 303;
    static NotModified: 304 = 304;
    static UseProxy: 305 = 305;
    static SwitchProxy: 306 = 306;
    static TemporaryRedirect: 307 = 307;
    static PermanentRedirect: 308 = 308;

    /**
     * 4xx Client errors
     */
    static BadRequest: 400 = 400;
    static Unauthorized: 401 = 401;
    static PaymentRequired: 402 = 402;
    static Forbidden: 403 = 403;
    static NotFound: 404 = 404;
    static MethodNotAllowed: 405 = 405;
    static NotAcceptable: 406 = 406;
    static ProxyAuthenticationRequired: 407 = 407;
    static RequestTimeout: 408 = 408;
    static Conflict: 409 = 409;
    static Gone: 410 = 410;
    static LengthRequired: 411 = 411;
    static PreconditionFailed: 412 = 412;
    static PayloadTooLarge: 413 = 413;
    static URITooLong: 414 = 414;
    static UnsupportedMediaType: 415 = 415;
    static RangeNotSatisfiable: 416 = 416;
    static ExpectationFailed: 417 = 417;
    static IMATeapot: 418 = 418;
    static MisdirectedRequest: 421 = 421;
    static UnprocessableEntity: 422 = 422;
    static Locked: 423 = 423;
    static FailedDependency: 424 = 424;
    static TooEarly: 425 = 425;
    static UpgradeRequired: 426 = 426;
    static PreconditionRequired: 428 = 428;
    static TooManyRequests: 429 = 429;
    static RequestHeaderFieldsTooLarge: 431 = 431;
    static UnavailableForLegalReasons: 451 = 451;

    /**
     * 5xx Server errors
     */
    static InternalServerError: 500 = 500;
    static NotImplemented: 501 = 501;
    static BadGateway: 502 = 502;
    static ServiceUnavailable: 503 = 503;
    static GatewayTimeout: 504 = 504;
    static HTTPVersionNotSupported: 505 = 505;
    static VariantAlsoNegotiates: 506 = 506;
    static InsufficientStorage: 507 = 507;
    static LoopDetected: 508 = 508;
    static NotExtended: 510 = 510;
    static NetworkAuthenticationRequired: 511 = 511;
}