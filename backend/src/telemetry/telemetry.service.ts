import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class TelemetryService {
    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async getRunwayFriction(runwayId: string) {
        try {
            const result = await this.elasticsearchService.search({
                index: 'logs-runway-sensors',
                query: { term: { 'runway_id': runwayId } },
                sort: [{ timestamp: 'desc' }],
                size: 20,
            });

            return result.hits.hits.map((hit: any) => ({
                time: new Date(hit._source.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                friction: hit._source.mu_value,
            })).reverse();
        } catch (e: any) {
            // Fallback to mock data if index doesn't exist yet
            console.log("Error in getRunwayFriction", e?.message || e);
            return [
                { time: '12:00', friction: 0.82 },
                { time: '12:15', friction: 0.78 },
                { time: '12:30', friction: 0.65 },
                { time: '12:45', friction: 0.52 },
                { time: '13:00', friction: 0.48 },
                { time: '13:15', friction: 0.42 },
                { time: '13:30', friction: 0.38 },
                { time: '13:45', friction: 0.45 },
                { time: '14:00', friction: 0.62 },
            ];
        }
    }

    async getControlTowerStatus() {
        const runways = ['RWY-04R', 'RWY-04L', 'RWY-13R', 'RWY-22L', 'RWY-31R', 'RWY-09L', 'RWY-09R'];

        const statusPromises = runways.map(async (runway) => {
            try {
                const result = await this.elasticsearchService.search({
                    index: 'logs-runway-sensors',
                    query: { term: { 'runway_id': runway } },
                    sort: [{ timestamp: 'desc' }],
                    size: 1,
                });

                if (result.hits.hits.length > 0) {
                    const latest = result.hits.hits[0]._source as any;
                    return {
                        id: runway,
                        mu: latest.mu_value,
                        status: latest.mu_value < 0.42 ? 'CRITICAL' : latest.mu_value < 0.55 ? 'WARNING' : 'NORMAL',
                        location: Array.isArray(latest.location) ? latest.location : [-73.7781, 40.6413],
                        timestamp: latest.timestamp,
                    };
                }
            } catch (e: any) {
                console.log(`Error fetching status for ${runway}`, e?.message || e);
            }
            // Fallback for this specific runway if ES fails or has no data
            return { id: runway, mu: 0.8, status: 'NORMAL', location: [-73.7781, 40.6413], timestamp: new Date() };
        });

        return Promise.all(statusPromises);
    }

    async getWeather(icao: string) {
        try {
            const result = await this.elasticsearchService.search({
                index: 'logs-weather-sensors',
                query: { term: { icao } },
                sort: [{ timestamp: 'desc' }],
                size: 1,
            });

            if (result.hits.hits.length > 0) {
                return result.hits.hits[0]._source as any;
            }
        } catch (e: any) {
            console.log('Error in getWeather', e?.message || e);
        }

        // Fallback mock data
        return {
            station: icao,
            wind: '230° @ 12kts',
            precip: 'None',
            temp: '18°C / 12°C',
            vis: '10SM +',
            metar: `METAR ${icao} 181251Z 23012KT 10SM CLR 18/12 A2992 RMK AO2 SLP131 T01830117`,
            status: 'VFR - CLEAR'
        };
    }

    async getIotHealth() {
        let sensors: any[] = [];
        try {
            const result = await this.elasticsearchService.search({
                index: 'logs-iot-sensors',
                sort: [{ timestamp: 'desc' }],
                size: 6,
            });

            if (result.hits.hits.length > 0) {
                sensors = result.hits.hits.map(hit => hit._source);
            }
        } catch (e: any) {
            console.log('Error in getIotHealth', e?.message || e);
            sensors = [
                { id: 'FRIC-001', type: 'Friction', location: 'RWY-04R', status: 'ONLINE', battery: '92%', lastHeartbeat: new Date() },
                { id: 'FRIC-002', type: 'Friction', location: 'RWY-04L', status: 'ONLINE', battery: '88%', lastHeartbeat: new Date() },
                { id: 'FRIC-003', type: 'Friction', location: 'RWY-13R', status: 'ONLINE', battery: '95%', lastHeartbeat: new Date() },
                { id: 'WTHR-JFK', type: 'Weather Station', location: 'Terminal 4', status: 'ONLINE', battery: 'AC', lastHeartbeat: new Date() },
                { id: 'CAM-09L', type: 'Visual Inspection', location: 'RWY-09L Tap', status: 'WARNING', battery: '74%', lastHeartbeat: new Date(Date.now() - 500000) },
                { id: 'GRID-01', type: 'Mesh Node', location: 'South Field', status: 'ONLINE', battery: '98%', lastHeartbeat: new Date() },
            ];
        }

        const onlineCount = sensors.filter(s => s.status === 'ONLINE').length;
        const warningCount = sensors.length - onlineCount;

        return {
            totalDevices: sensors.length,
            onlineCount: onlineCount,
            warningCount: warningCount,
            overallStatus: (onlineCount > warningCount) ? 'HEALTHY' : 'WARNING',
            sensors,
        };
    }

    async getNotams() {
        try {
            const result = await this.elasticsearchService.search({
                index: 'logs-notams',
                query: { match_all: {} },
                sort: [{ timestamp: 'desc' }],
                size: 6,
            });

            if (result.hits.hits.length > 0) {
                return result.hits.hits.map(hit => hit._source);
            }
        } catch (e: any) {
            console.log('Error in getNotams', e?.message || e);
        }

        return [
            {
                id: 'A1234/26',
                category: 'RUNWAY',
                level: 'CRITICAL',
                title: 'RWY 04L/22R CLOSED DUE TO MAINTENANCE',
                content: 'RUNWAY 04L/22R CLOSED FOR FRICTION ENHANCEMENT TREATMENT. DAILY 1200-1800UTC.',
                issued: new Date(Date.now() - 3600000),
                expiry: new Date(Date.now() + 86400000)
            },
            {
                id: 'B5678/26',
                category: 'LIGHTING',
                level: 'WARNING',
                title: 'PAPI RWY 13R UNSERVICEABLE',
                content: 'PRECISION APPROACH PATH INDICATOR (PAPI) RUNWAY 13R OUT OF SERVICE UNTIL FURTHER NOTICE.',
                issued: new Date(Date.now() - 7200000),
                expiry: new Date(Date.now() + 172800000)
            }
        ];
    }

    async getAlertLog() {
        try {
            const result = await this.elasticsearchService.search({
                index: 'logs-runway-sensors',
                query: {
                    range: { mu_value: { lt: 0.55 } }
                },
                sort: [{ timestamp: 'desc' }],
                size: 50,
            });

            return result.hits.hits.map((hit: any) => ({
                id: hit._id,
                timestamp: hit._source.timestamp,
                runwayId: hit._source.runway_id,
                mu: hit._source.mu_value,
                status: hit._source.mu_value < 0.42 ? 'CRITICAL' : 'WARNING',
                location: Array.isArray(hit._source.location) ? hit._source.location : [-73.7781, 40.6413],
            }));
        } catch (e: any) {
            console.log("Error in getAlertLog", e?.message || e);
            // Return some mock alerts for demo if ES fails
            return [
                { id: '1', timestamp: new Date(Date.now() - 100000), runwayId: 'RWY-04R', mu: 0.38, status: 'CRITICAL', location: [-73.7781, 40.6413] },
                { id: '2', timestamp: new Date(Date.now() - 500000), runwayId: 'RWY-13R', mu: 0.48, status: 'WARNING', location: [-73.7781, 40.6413] },
                { id: '3', timestamp: new Date(Date.now() - 900000), runwayId: 'RWY-22L', mu: 0.35, status: 'CRITICAL', location: [-73.7781, 40.6413] },
            ];
        }
    }
}
