// App —— 状态机 Root：按 screen 分发到对应视图
import { useBedtime } from './hooks/useBedtime';
import { Setup } from './components/screens/Setup';
import { Home } from './components/screens/Home';
import { BedtimeTrigger } from './components/screens/BedtimeTrigger';
import { AIAnalysis } from './components/screens/AIAnalysis';
import { MiniAction } from './components/screens/MiniAction';
import { ToolCall } from './components/screens/ToolCall';
import { DeviceRequest } from './components/screens/DeviceRequest';
import { EndChoice } from './components/screens/EndChoice';
import { CompleteAction } from './components/screens/CompleteAction';
import { ScreenOff } from './components/screens/ScreenOff';
import { ShowReflection } from './components/screens/ShowReflection';
import { Continue } from './components/screens/Continue';
import { EndToday } from './components/screens/EndToday';
import { MorningFeedback } from './components/screens/MorningFeedback';

export default function App() {
  const api = useBedtime();
  const { state } = api;

  // 结束页的"明天第一件事"
  const firstThing = state.analysis?.tomorrow_action || state.todos[state.todos.length - 1]?.text || '';

  let view: React.ReactNode;
  switch (state.screen) {
    case 'SETUP':
      view = <Setup initial={state.settings} onSave={api.saveSettings} onBack={api.goHome} />;
      break;
    case 'HOME':
      view = (
        <Home
          settings={state.settings}
          history={state.history}
          onEnterBedtime={api.enterBedtime}
          onStartNewDay={api.startNewDay}
          onOpenSettings={api.openSettings}
        />
      );
      break;
    case 'BEDTIME_TRIGGER':
      view = <BedtimeTrigger clock={state.demoClock} onSubmit={api.submitThought} onSkip={api.skipThought} />;
      break;
    case 'AI_ANALYSIS':
      view = <AIAnalysis />;
      break;
    case 'MINI_ACTION':
      view = state.analysis ? (
        <MiniAction analysis={state.analysis} onOpenDoc={api.openDocument} onComplete={api.completeMiniAction} />
      ) : (
        <AIAnalysis />
      );
      break;
    case 'TOOL_CALL':
      view = state.analysis ? (
        <ToolCall
          target={state.toolOpened ?? ''}
          tomorrowAction={state.analysis.tomorrow_action}
          onDone={api.completeMiniAction}
        />
      ) : (
        <AIAnalysis />
      );
      break;
    case 'DEVICE_REQUEST':
      view = state.analysis ? (
        <DeviceRequest
          target={state.analysis.target || 'alarm'}
          tomorrowAction={state.analysis.tomorrow_action}
          onDone={api.deviceDone}
        />
      ) : (
        <AIAnalysis />
      );
      break;
    case 'END_CHOICE':
      view = (
        <EndChoice
          context={
            state.analysis?.state === 'device_request'
              ? '闹钟 / 勿扰已经帮你设好了。今晚就到这？'
              : '好像没什么放心不下的了。'
          }
          history={state.history}
          onEnd={api.screenOff}
          onContinue={api.respectContinue}
        />
      );
      break;
    case 'SCREEN_OFF':
      view = <ScreenOff onWake={api.startNewDay} />;
      break;
    case 'COMPLETE_ACTION':
      view = state.analysis ? (
        <CompleteAction
          analysis={state.analysis}
          history={state.history}
          onEnd={api.screenOff}
          onContinue={api.respectContinue}
        />
      ) : (
        <AIAnalysis />
      );
      break;
    case 'SHOW_REFLECTION':
      view = state.analysis ? (
        <ShowReflection
          analysis={state.analysis}
          history={state.history}
          onEnd={api.screenOff}
          onContinue={api.respectContinue}
        />
      ) : (
        <AIAnalysis />
      );
      break;
    case 'CONTINUE':
      view = <Continue onGoHome={api.goHome} />;
      break;
    case 'END_TODAY':
      view = <EndToday firstThing={firstThing} onFinish={api.startNewDay} />;
      break;
    case 'MORNING_FEEDBACK':
      view = <MorningFeedback endTime={lastEndTime(state)} onMood={api.recordMood} />;
      break;
    default:
      view = (
        <Home
          settings={state.settings}
          history={state.history}
          onEnterBedtime={api.enterBedtime}
          onStartNewDay={api.startNewDay}
          onOpenSettings={api.openSettings}
        />
      );
  }

  return (
    <div className="app">
      <div className="stars" />
      <div className="main">{view}</div>
      <div className="foot">今晚，好好睡了吗？ · Mini Build Demo</div>
    </div>
  );
}

function lastEndTime(state: ReturnType<typeof useBedtime>['state']): string {
  const last = state.history[state.history.length - 1];
  return last ? last.endTime : '00:00';
}
