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

const fs = require('fs')
const util = require('util')
 
/**
 * Generates a trace file that can be loaded into chrome://tracing or ui.perfetto.dev.
 * In perfetto, events can be seen with the following SQL query followed by CTRL+Enter:
 * 
 *      SELECT * FROM slices WHERE category == matternode
 */
class Tracer {
    static TRACE_FILE = 'matternode.trace'
    static TRACE_CATEGORY = 'matternode'
    static TRACE_DURATION = 0

    // Per spec at https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU
    static Type = {
        Begin: 'B',
        End: 'E',
        Complete: 'X',
        Meta: 'M',
        Instant: 'i',
        Counter: 'C',
        Sample: 'S',
        MemGlobal: 'V',
        MemProcess: 'v',
        Obj: 'O',
        ObjNew: 'N',
        ObjDestroy: 'D',
        AsyncBegin: 'b',
        AsyncInstant: 'i',
        AsyncEnd: 'e',
        FlowStart: 's',
        FlowStep: 't',
        FlowEnd: 'f',
        ClockSync: 'c',
    }

    constructor(filename=Tracer.TRACE_FILE) {
        this._traceLevel = 1   // Default to enabled

        var nodeNum = 0
        var dir = '.node' + nodeNum + "/"
        this._writer = fs.createWriteStream(dir+filename)
        this._writer.on('error',  (error) => {
            console.log(`Error in Tracer write: ${error.message}`);
        })
        process.on('exit', () => {
            // Write final JSON closure when app closes.
            this.writeFooter()
        })
        this._pid = process.pid
        this.writeHeader()
    }

    get level() { return this._traceLevel }
    set level(v) {
        if (!(v == 0 || v == 1)) throw("Invalid value")
        this._traceLevel = v
    }

    writeHeader() {
        this._writer.write('{"traceEvents":[')
        this.meta("process_name",{name:Tracer.TRACE_CATEGORY})
        this.meta("thread_name",{name:Tracer.TRACE_CATEGORY+" thread"})
    }

    writeFooter() {
        this._writer.write('{}]}')
    }

    emit(name=something, ph=Tracer.Type.Complete, args) {
        if (this._traceLevel == 0) return

        var now = (new Date()).getTime()
        var duration = Tracer.TRACE_DURATION
        var traceEntry = {
            pid: this._pid,
            tid: this._tid,
            ts: now,
            cat: Tracer.TRACE_CATEGORY,
            dur: duration,
            ph: ph,
            name: name,
            args
        }
        var traceLine = JSON.stringify(traceEntry)+','
        this._writer.write(traceLine)
    }

    begin(name='event') { this.emit(name,Tracer.Type.Begin) }
    end(name='event') { this.emit(name,Tracer.Type.End) }
    event(name='event') { this.emit(name,Tracer.Type.Complete) }
    instant(name='event') { this.emit(name,Tracer.Type.Instant) }

    asyncBegin(name='async') { this.emit(name,Tracer.Type.AsyncBegin) }
    asyncStep(name='async') { this.emit(name,Tracer.Type.AsyncInstant) }
    asyncEnd(name='async') { this.emit(name,Tracer.Type.AsyncEnd) }

    flowStart(name='flow') { this.emit(name,Tracer.Type.FlowStart) }
    flowStep(name='flow') { this.emit(name,Tracer.Type.FlowStep) }
    flowEnd(name='flow') { this.emit(name,Tracer.Type.FlowEnd) }

    meta(name='meta',args={}) { this.emit(name,Tracer.Type.Meta,args) }

    obj(name='obj',args={}) { this.emit(name,Tracer.Type.Obj,args) }
    objNew(name='obj new',args={}) { this.emit(name,Tracer.Type.Complete,args) }
    //objNew(name='obj new',args={}) { this.emit(name,Tracer.Type.ObjNew,args) }
    objDestroy(name='obj destroy',args={}) { this.emit(name,Tracer.Type.ObjDestroy,args) }

    memGlobal(name='global memory',args={}) { this.emit(name,Tracer.Type.MemGlobal,args) }
    memTask(name='task memory',args={}) { this.emit(name,Tracer.Type.MemProcess,args) }
}

var tracer = new Tracer()

module.exports = tracer