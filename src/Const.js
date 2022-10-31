/**
 * Copyright 2022 Project CHIP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *  https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Const
{
    static Protocols = {
        SECURE_CHANNEL:     0x0000,     // Secure Channel: PASE, CASE, MRP, MCSP
        INTERACTION_MODEL:  0x0001,     // Interaction Model (IM)
        BDX:                0x0002,     // Bulk Data Exchange (BDX)
        COMMISSIONING:      0x0003,     // User Directed Commissioning (UDC)
        ECHO:               0x0004,     // Echo protocol for testing
    }

    static Clusters = {
        IDENTITY:                       0x0003,
        GROUPS:                         0x0004,
        SCENES:                         0x0005,
        ON_OFF:                         0x0006,
        LEVEL:                          0x0008,

        DESCRIPTOR:                     0x001D,
        BINDING:                        0x001E,
        ACCESS_CONTROL:                 0x001F,

        BRIDGED_ACTIONS:                0x0025,
        GENERAL_COMMISSIONING:          0x0030,
        NETWORK_COMMISSIONING:          0x0031,
        BRIDGED_DEVICE_BASIC_INFO:      0x0039,
        SWITCH:                         0x003B,

        OPERATIONAL_CREDENTIALS:        0x003E, // 62

        FIXED_LABEL:                    0x0040,
        USER_LABEL:                     0x0041,
        PROXY_CONFIGURATION:            0x0042,
        PROXY_DISCOVERY:                0x0043,

        BOOLEAN:                        0x0045,
        MODE_SELECT:                    0x0050,

        DOOR_LOCK:                      0x0101,
        WINDOW_COVERING:                0x0102,

        PUMP_CONTROL:                   0x0200,
        THERMOSTAT:                     0x0201,
        FAN_CONTROL:                    0x0202,
        THERMOSTAT_UI_CONFIGURATION:    0x0204,

        COLOR_CONTROL:                  0x0300,
        BALAST_CONFIGURATION:           0x0301,

        ILLUMINANCE_MEASUREMENT:        0x0400,
        TEMPERATURE_MEASUREMENT:        0x0402,
        PRESSURE_MEASUREMENT:           0x0403,
        FLOW_MEASUREMENT:               0x0404,
        HUMIDITY_MEASUREMENT:           0x0405,
        OCCUPANCY_MEASUREMENT:          0x0406,
        LEAF_WETNESS:                   0x0407,
        SOIL_MOISTURE:                  0x0408,

        WAKE_ON_LAN:                    0x0503,
        CHANNEL:                        0x0504,
        TARGET_NAVIGATOR:               0x0505,
        MEDIA_PLAYBACK:                 0x0506,
        MEDIA_INPUT:                    0x0507,
        LOW_POWER:                      0x0508,
        KEYPAD_INPUT:                   0x0509,
        CONTENT_LAUNCHER:               0x050A,
        AUDIO_OUTPUT:                   0x050B,
        APP_LAUNCHER:                   0x050C,
        APP_BASIC:                      0x050D,
        ACCOUNT_LOGIN:                  0x050E,
    }
}

module.exports = Const