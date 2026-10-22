import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Hand-written day lines for the week-ahead strip, one per Moon sign, in the
 * blunt diagnostic register of the daily corpus (aspectReadings.ts): a short
 * directive and one concrete use for the day. Universal; the deity placement
 * line is layered on beneath as the ancient sourcing.
 */
export interface WeekReading {
  headline: string;
  body: string;
}

export const WEEK_READINGS: Readonly<Record<ZodiacSign, WeekReading>> = {
  Aries: {
    headline: "Start it early.",
    body: "This day rewards the first move and punishes the long warm-up. Whatever scares you most on the list, do it first; the afternoon version of you will talk you out of it.",
  },
  Taurus: {
    headline: "Slow down on purpose.",
    body: "This day moves at the body's pace, not the calendar's. Cook the real meal, finish one thing properly, and refuse the hurry. The people rushing past you will be redoing their work tomorrow.",
  },
  Gemini: {
    headline: "Burn through the list.",
    body: "Your attention is split today, so stop fighting it and clear the small stuff: the errands, the unanswered emails, the calls you keep rolling forward. Forty small wins will settle your head.",
  },
  Cancer: {
    headline: "Stay close to home.",
    body: "This day wants less world and more shelter. Decline the optional plan, cook for the people who are actually yours, and let the phone sit unanswered for the evening.",
  },
  Leo: {
    headline: "Take the credit.",
    body: "You did the work; today is for being seen doing it. Show the thing and take the compliment without the joke that deflects it. Modesty that hides your work is just fear with better manners.",
  },
  Virgo: {
    headline: "Fix one real thing.",
    body: "Today is for repair, not critique. Fix the thing that has been quietly costing you: the form, the leak, the appointment you keep not booking. Aim none of the precision at yourself.",
  },
  Libra: {
    headline: "Settle it together.",
    body: "Today favors the conversation over the standoff. Make the overdue call and hear the other side out, but do not say yes just to end the discomfort. Agreement you do not mean is a slower argument.",
  },
  Scorpio: {
    headline: "Go below the surface.",
    body: "Small talk dies today. Ask the one real question you have been circling, or sit alone with it and write the answer down. The people close to you can already tell you are performing fine.",
  },
  Sagittarius: {
    headline: "Widen the frame.",
    body: "The restlessness is information: your life has gotten one size too small. Book the trip, sign up for the course, walk a route you have never walked. Widen the frame without torching what is behind you.",
  },
  Capricorn: {
    headline: "Do the unglamorous work.",
    body: "Today pays slow compound interest. Put the hour into the long project nobody is clapping for, and ignore the itch to be impressive instead of useful. Finished beats flashy.",
  },
  Aquarius: {
    headline: "Break the routine once.",
    body: "The usual way is just a habit wearing a uniform today. Try the odd idea, take the different route, ask the question nobody at the table is asking. One deliberate break is enough.",
  },
  Pisces: {
    headline: "Guard your soft hours.",
    body: "You absorb whatever you are near today, so choose your inputs like they are food. Skip the draining friend and the doomscroll; keep the music, the nap, the water.",
  },
};
