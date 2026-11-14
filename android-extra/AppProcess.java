package io.github.monowordtest;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.Process;

import java.util.List;

/**
 * Makes "closed" really mean "gone from RAM".
 *
 * - exitAll(): used by the Exit button. Removes EVERY task of this app (the game and the hidden
 *   SecretActivity may live in different tasks, so finishing only the current activity could reveal the other one).
 * - created()/destroyed(): when the last activity of the app is destroyed for good (Back, Exit, swiped away
 *   from Recents) the process is killed. Home / app switching only stops activities, so nothing is killed then.
 *
 * The kill is delayed a few seconds so that the WebView can finish writing localStorage (settings and imported
 * languages), and it is skipped if the app is opened again in the meantime.
 */
final class AppProcess {
    private static final long KILL_DELAY_MS = 6000;
    private static final Handler HANDLER = new Handler(Looper.getMainLooper());
    private static int alive = 0;

    private AppProcess() { }

    static void created() {
        alive++;
    }

    static void destroyed(Activity a) {
        alive--;
        if (alive <= 0 && !a.isChangingConfigurations()) {
            scheduleKill();
        }
    }

    static void exitAll(Activity a) {
        try {
            ActivityManager am = (ActivityManager) a.getSystemService(Context.ACTIVITY_SERVICE);
            List<ActivityManager.AppTask> tasks = am.getAppTasks();
            for (ActivityManager.AppTask t : tasks) {
                t.finishAndRemoveTask();
            }
        } catch (Exception ignored) {
            // fall through to finishing the current task
        }
        a.finishAndRemoveTask();
        scheduleKill();
    }

    private static void scheduleKill() {
        HANDLER.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (alive <= 0) {            // nothing was opened again meanwhile
                    Process.killProcess(Process.myPid());
                    System.exit(0);
                }
            }
        }, KILL_DELAY_MS);
    }
}
