import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class DataGeneratorService implements OnModuleInit {
    private readonly logger = new Logger(DataGeneratorService.name);

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    onModuleInit() {
        this.logger.log('Starting simulated data stream...');
        // Start generating fake sensor data
        setInterval(() => this.generateFrictionLog(), 30000);
        setInterval(() => this.generateWeatherLog(), 30000);
        setInterval(() => this.generateIotHeartbeat(), 30000);
        setInterval(() => this.generateNotams(), 30000);
    }

    private async generateFrictionLog() {
        const timestamp = new Date();
        const frictionValue = (Math.random() * (0.9 - 0.3) + 0.3).toFixed(2);
        const runways = ['RWY-04R', 'RWY-04L', 'RWY-13R', 'RWY-22L', 'RWY-31R', 'RWY-09L', 'RWY-09R'];
        const runwayId = runways[Math.floor(Math.random() * runways.length)];

        // Random offset for JFK area
        const lat = 40.6413 + (Math.random() - 0.5) * 0.02;
        const lon = -73.7781 + (Math.random() - 0.5) * 0.02;

        const log = {
            event_type: 'runway_friction',
            runway_id: runwayId,
            mu_value: parseFloat(frictionValue),
            timestamp,
            location: [lon, lat], // Coordinates [lon, lat]
            sensor_id: 'GripTester-V1',
        };

        try {
            await this.elasticsearchService.index({
                index: 'logs-runway-sensors',
                refresh: true,
                document: log,
            });
            this.logger.debug(`Streamed Friction: ${frictionValue} for ${runwayId}`);
        } catch (e: any) {
            this.logger.error(`Failed to stream friction data: ${e.message}`, e.meta?.body?.error || e);
        }
    }

    private async generateWeatherLog() {
        const timestamp = new Date();
        const windSpeed = Math.floor(Math.random() * 30);
        const windDir = Math.floor(Math.random() * 360);

        const log = {
            event_type: 'weather_observation',
            icao: 'KJFK',
            wind_speed_kts: windSpeed,
            wind_direction_deg: windDir,
            temperature_c: Math.floor(Math.random() * 35),
            timestamp,
        };

        try {
            await this.elasticsearchService.index({
                index: 'logs-weather-sensors',
                document: log,
            });
            this.logger.debug(`Streamed Weather: ${windSpeed}kts at ${windDir}°`);
        } catch (e: any) {
            this.logger.error(`Failed to stream weather data: ${e.message}`, e.meta?.body?.error || e);
        }
    }

    private async generateIotHeartbeat() {
        const sensors = [
            { id: 'FRIC', type: 'Friction', location: 'RWY-04R' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-04L' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-13R' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-22L' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-31R' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-09L' },
            { id: 'FRIC', type: 'Friction', location: 'RWY-09R' },

            { id: 'WTHR-JFK', type: 'Weather Station', location: 'Terminal 4' },
            { id: 'WTHR-JFK', type: 'Weather Station', location: 'Terminal 13' },
            { id: 'WTHR-JFK', type: 'Weather Station', location: 'Terminal 9' },

            { id: 'CAM', type: 'Visual Inspection', location: 'RWY-09L Tap' },

            { id: 'GRID', type: 'Mesh Node', location: 'South Field' },
        ];

        const timestamp = new Date();

        for (const sensor of sensors) {
            const status = Math.random() > 0.8 ? 'ONLINE' : (Math.random() > 0.5 ? 'WARNING' : 'OFFLINE');
            const battery = sensor.id === 'WTHR-JFK' ? 'AC' : `${Math.floor(Math.random() * 20) + 80}%`;
            sensor.id = `${sensor.id}-${Math.floor(Math.random() * 30)}`;

            const log = {
                ...sensor,
                status,
                battery,
                lastHeartbeat: timestamp,
                timestamp,
            };

            try {
                await this.elasticsearchService.index({
                    index: 'logs-iot-sensors',
                    document: log,
                });
            } catch (e: any) {
                this.logger.error(`Failed to stream IOT data for ${sensor.id}: ${e.message}`);
            }
        }
        this.logger.debug(`Streamed heartbeats for ${sensors.length} IOT sensors`);
    }


    private async generateNotams() {
        const categories = ["RUNWAY", "TAXIWAY", "AIRSPACE", "PROCEDURE", "EQUIPMENT", "LIGHTING", "SAFETY", "OTHER"];
        const levels = ["INFO", "WARNING", "CRITICAL"];

        const category = categories[Math.floor(Math.random() * categories.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const id = `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(1000 + Math.random() * 9000)}/26`;

        const templates: Record<string, { title: string; content: string }[]> = {
            RUNWAY: [
                { title: "RWY 04L/22R CLOSED", content: "RUNWAY 04L/22R CLOSED DUE TO SCHEDULED MAINTENANCE. DAILY 1200-1800UTC." },
                { title: "SOFT SPOTS REPORTED", content: "PILOTS ARE ADVISED OF SOFT SPOTS ON RWY 13R SHOULDER EXERCISE CAUTION." },
                { title: "RWY 09L FRICTION REDUCED", content: "RUNWAY 09L FRICTION LEVELS REDUCED DUE TO RUBBER ACCUMULATION." }
            ],
            TAXIWAY: [
                { title: "TWY ALPHA CLOSED", content: "TAXIWAY ALPHA CLOSED BETWEEN TWY B AND TWY C FOR PAVEMENT REPAIR." },
                { title: "TWY KILO RESTRICTION", content: "TAXIWAY KILO RESTRICTED TO AIRCRAFT WITH WINGSPAN LESS THAN 118FT." }
            ],
            LIGHTING: [
                { title: "PAPI RWY 31R OTS", content: "PRECISION APPROACH PATH INDICATOR FOR RWY 31R OUT OF SERVICE." },
                { title: "RWY EDGE LIGHTS OUT", content: "NORTH 2000FT OF RWY 22L EDGE LIGHTS UNSERVICEABLE." }
            ],
            SAFETY: [
                { title: "BIRD ACTIVITY", content: "INCREASED BIRD ACTIVITY REPORTED IN THE VICINITY OF THE AIRPORT. PILOTS TO EXERCISE CAUTION." },
                { title: "FOD ON TAXIWAY", content: "FOREIGN OBJECT DEBRIS REPORTED ON TWY BRAVO NEAR HANGAR 4." }
            ],
            EQUIPMENT: [
                { title: "ILS RWY 04R UNSERVICEABLE", content: "ILS CATEGORY II/III APPROACH FOR RWY 04R SUSPENDED UNTIL FURTHER NOTICE." },
                { title: "DVOR JFK OTS", content: "JFK VOR/DME 115.9 OUT OF SERVICE FOR PREVENTATIVE MAINTENANCE." }
            ],
            OTHER: [
                { title: "CONSTRUCTION CRANE", content: "CONSTRUCTION CRANE OPERATING 2NM SOUTH OF AIRFIELD. MAX HEIGHT 150FT AGL. FLAGGED AND LIGHTED." }
            ]
        };

        const templateSet = templates[category] || templates.OTHER;
        const template = templateSet[Math.floor(Math.random() * templateSet.length)];

        const timestamp = new Date();
        const log = {
            id,
            category,
            level,
            title: template.title,
            content: template.content,
            issued: new Date(timestamp.getTime() - Math.random() * 86400000), // Random time in last 24h
            expiry: new Date(timestamp.getTime() + Math.random() * 604800000), // Random time in next 7 days
            timestamp
        };

        try {
            await this.elasticsearchService.index({
                index: 'logs-notams',
                document: log,
            });
            this.logger.debug(`Streamed NOTAM: ${id} - ${template.title}`);
        } catch (e: any) {
            this.logger.error(`Failed to stream NOTAM data: ${e.message}`, e.meta?.body?.error || e);
        }
    }
}
