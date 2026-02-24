import { Controller, Get, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
    constructor(private readonly telemetryService: TelemetryService) { }

    @Get('friction')
    getFriction(@Query('runwayId') runwayId: string) {
        return this.telemetryService.getRunwayFriction(runwayId || '09L');
    }

    @Get('weather')
    getWeather(@Query('icao') icao: string) {
        return this.telemetryService.getWeather(icao || 'KJFK');
    }

    @Get('tower')
    getTowerStatus() {
        return this.telemetryService.getControlTowerStatus();
    }

    @Get('health')
    getHealth() {
        return this.telemetryService.getIotHealth();
    }

    @Get('notams')
    getNotams() {
        return this.telemetryService.getNotams();
    }

    @Get('alerts')
    getAlerts() {
        return this.telemetryService.getAlertLog();
    }
}
