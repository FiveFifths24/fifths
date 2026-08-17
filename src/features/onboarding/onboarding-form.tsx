"use client";

import { useActionState, useRef, useState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import type { Interest, Skill } from "@/types/database";

import { completeOnboardingAction } from "./actions";

const steps = [
  {
    number: "01",
    title: "Set Up How You'll Show Up Around SIGNAL.",
  },
  {
    number: "02",
    title: "Where Are You Based?",
    description:
      "Your general location helps SIGNAL recommend people, places, and events that make sense for you.",
  },
  {
    number: "03",
    title: "What Shapes You?",
    description:
      "Pick the interests and skills that feel most like you. These help shape what SIGNAL brings your way. ",
  },
  {
    number: "04",
    title: "How Do You Want To Connect?",
    description: "Choosing the kinds of relationships you are open to.",
  },
  {
    number: "05",
    title: "What Helps You Participate Comfortably?",
    description:
      "Share any access preferences that can help SIGNAL recommend experiences that work better for you.",
  },
  {
    number: "06",
    title: "You're SIGNAL Profile Is Ready.",
  },
] as const;

type PreferenceChoice = {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
};

const connectionChoices: PreferenceChoice[] = [
  {
    name: "openToFriends",
    label: "Friendship",
    description: "Meet people for genuine social connection and community.",
  },
  {
    name: "openToActivityPartners",
    label: "Activity Partners",
    description:
      "Find people to explore hobbies, outings, and experiences with.",
  },
  {
    name: "openToCreativeCollaboration",
    label: "Creative Collaboration",
    description: "Make, build, write, perform, design, or create with others.",
  },
  {
    name: "openToProfessionalNetworking",
    label: "Professional Connections",
    description: "Connect around careers, projects, ideas, and opportunities.",
  },
  {
    name: "openToMentorship",
    label: "Mentorship",
    description: "Learn from someone, share what you know, or do both.",
  },
  {
    name: "openToVolunteering",
    label: "Community & Volunteering",
    description:
      "Get involved in service, local projects, and community efforts.",
  },
  {
    name: "openToGaming",
    label: "General Gaming & Esports",
    description: "Connect for video games, tabletop, TTRPGs, and group play.",
  },
  {
    name: "openToTravelGroups",
    label: "Travel & Group Experiences",
    description:
      "Find people for trips, conventions, day outings, and shared adventures.",
  },
];

const recommendationChoices: PreferenceChoice[] = [
  {
    name: "preferLocal",
    label: "Prioritize local recommendations",
    defaultChecked: true,
  },
  {
    name: "preferVirtual",
    label: "Include virtual recommendations",
    defaultChecked: true,
  },
  {
    name: "allowFriendRequests",
    label: "Allow friend requests",
    defaultChecked: true,
  },
  {
    name: "allowCircleInvites",
    label: "Allow Circle invitations",
    defaultChecked: true,
  },
  {
    name: "allowEventInvites",
    label: "Allow event invitations",
    defaultChecked: true,
  },
  {
    name: "showInMutualConnections",
    label: "Show me through mutual connections",
    defaultChecked: true,
  },
];

const accessibilityChoices: PreferenceChoice[] = [
  {
    name: "stepFreeAccess",
    label: "Step-free access",
  },
  {
    name: "seatingAvailable",
    label: "Seating availability",
  },
  {
    name: "lowSensoryEnvironment",
    label: "Low-sensory environments",
  },
  {
    name: "captioning",
    label: "Captioning",
  },
  {
    name: "aslInterpretation",
    label: "ASL interpretation",
  },
  {
    name: "accessibleRestroom",
    label: "Accessible restrooms",
  },
  {
    name: "mobilityDeviceAccess",
    label: "Mobility-device access",
  },
  {
    name: "virtualParticipation",
    label: "Virtual participation",
  },
  {
    name: "writtenInstructions",
    label: "Clear written instructions",
  },
  {
    name: "breaksAvailable",
    label: "Additional time or breaks",
  },
];

function ChoiceGrid({
  legend,
  hint,
  name,
  choices,
}: {
  legend: string;
  hint: string;
  name: "interestIds" | "skillIds";
  choices: Array<Pick<Interest | Skill, "id" | "name">>;
}) {
  return (
    <fieldset>
      <legend className="text-xl font-bold text-white">{legend}</legend>

      <p className="mt-2 text-sm leading-6 text-white/50">{hint}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {choices.map((choice) => (
          <label
            className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/5 has-checked:border-[#ca9aff]/70 has-checked:bg-[#6c14ce]/15 has-checked:text-white"
            key={choice.id}
          >
            <input
              className="size-5 shrink-0 accent-[#a855f7]"
              name={name}
              type="checkbox"
              value={choice.id}
            />

            <span>{choice.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PreferenceGrid({ choices }: { choices: PreferenceChoice[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => (
        <label
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/20 hover:bg-white/5 has-checked:border-[#ca9aff]/70 has-checked:bg-[#6c14ce]/15"
          key={choice.name}
        >
          <input
            className="mt-0.5 size-5 shrink-0 accent-[#a855f7]"
            defaultChecked={choice.defaultChecked}
            name={choice.name}
            type="checkbox"
          />

          <span>
            <span className="block text-sm font-semibold text-white">
              {choice.label}
            </span>

            {choice.description ? (
              <span className="mt-1 block text-xs leading-5 text-white/45">
                {choice.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

function SelectField({
  id,
  label,
  name,
  defaultValue,
  children,
  hint,
  required = false,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-white/85"
        htmlFor={id}
      >
        {label}
      </label>

      <select
        className="min-h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white transition outline-none hover:border-white/20 focus:border-[#ca9aff]"
        defaultValue={defaultValue}
        id={id}
        name={name}
        required={required}
      >
        {" "}
        {children}
      </select>

      {hint ? (
        <p className="mt-2 text-xs leading-5 text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}

export function OnboardingForm({
  interests,
  skills,
}: {
  interests: Array<Pick<Interest, "id" | "name">>;
  skills: Array<Pick<Skill, "id" | "name">>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action] = useActionState(
    completeOnboardingAction,
    initialActionState,
  );

  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const activeStep = steps[currentStep] ?? steps[0];

  function goBack() {
    setCurrentStep((step) => Math.max(0, step - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goForward() {
    const form = formRef.current;

    if (!form) return;

    const currentSection = form.querySelector<HTMLElement>(
      `[data-step="${currentStep}"]`,
    );

    if (!currentSection) return;

    setStepError(null);

    if (currentStep === 2) {
      const selectedInterests =
        currentSection.querySelectorAll<HTMLInputElement>(
          'input[name="interestIds"]:checked',
        );

      const selectedSkills = currentSection.querySelectorAll<HTMLInputElement>(
        'input[name="skillIds"]:checked',
      );

      if (selectedInterests.length === 0) {
        setStepError("Choose at least one interest to continue.");
        return;
      }

      if (selectedSkills.length === 0) {
        setStepError("Choose at least one skill to continue.");
        return;
      }

      if (selectedInterests.length > 12) {
        setStepError(
          `Choose no more than 12 interests. You currently have ${selectedInterests.length} selected.`,
        );
        return;
      }

      if (selectedSkills.length > 12) {
        setStepError(
          `Choose no more than 12 skills. You currently have ${selectedSkills.length} selected.`,
        );
        return;
      }
    }

    if (currentStep === 3) {
      const connectionNames = [
        "openToFriends",
        "openToActivityPartners",
        "openToCreativeCollaboration",
        "openToProfessionalNetworking",
        "openToMentorship",
        "openToVolunteering",
        "openToGaming",
        "openToTravelGroups",
      ];

      const hasConnectionPreference = connectionNames.some((name) =>
        currentSection.querySelector(`input[name="${name}"]:checked`),
      );

      if (!hasConnectionPreference) {
        setStepError(
          "Choose at least one way you'd like to connect to continue.",
        );
        return;
      }
    }

    const requiredFields = currentSection.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input[required], select[required], textarea[required]");

    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return;
      }
    }

    setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form
      ref={formRef}
      action={action}
      aria-label="Complete your SIGNAL profile"
      className="space-y-8"
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.18em] text-[#ca9aff] uppercase">
            Step {currentStep + 1} of {steps.length}
          </p>

          <p className="text-xs text-white/40">
            You can update these settings later.
          </p>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold tracking-[0.16em] text-white/35 uppercase">
            {activeStep.number}
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
            {activeStep.title}
          </h2>

          {"description" in activeStep ? (
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/50">
              {activeStep.description}
            </p>
          ) : null}
        </div>
      </div>

      <ActionStatus state={state} />
      {stepError ? (
        <div
          className="rounded-2xl border border-[#f359d2]/30 bg-[#f359d2]/10 px-4 py-3 text-sm text-[#f7c4ea]"
          role="alert"
        >
          {stepError}
        </div>
      ) : null}

      <section
        data-step="0"
        aria-labelledby="identity-step"
        className={currentStep === 0 ? "mt-15 space-y-6 pt-5" : "hidden"}
      >
        <h3 className="sr-only" id="identity-step">
          Your identity
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            autoComplete="nickname"
            error={firstFieldError(state, "displayName")}
            hint="Use the name you want people in SIGNAL to call you."
            label="What Should People Call You?"
            name="displayName"
            placeholder="Your name"
            required
          />

          <TextField
            autoCapitalize="none"
            autoComplete="username"
            error={firstFieldError(state, "username")}
            hint="Your unique SIGNAL @handle. Use lowercase letters, numbers, and underscores."
            label="Choose Your SIGNAL Handle"
            name="username"
            placeholder="your_name"
            required
          />

          <TextField
            error={firstFieldError(state, "pronouns")}
            hint="Optional. Share them if you’d like."
            label="Pronouns"
            name="pronouns"
            placeholder="she/her, he/him, they/them..."
          />

          <SelectField
            defaultValue="America/New_York"
            hint="This helps SIGNAL show events and plans at the right time."
            id="timezone"
            label="Your Time Zone"
            name="timezone"
          >
            <option value="America/New_York">Eastern time</option>
            <option value="America/Chicago">Central time</option>
            <option value="America/Denver">Mountain time</option>
            <option value="America/Phoenix">Arizona time</option>
            <option value="America/Los_Angeles">Pacific time</option>
            <option value="UTC">UTC</option>
          </SelectField>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-bold text-white/85"
            htmlFor="bio"
          >
            About You
          </label>

          <textarea
            className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white transition outline-none placeholder:text-white/25 hover:border-white/20 focus:border-[#ca9aff]"
            id="bio"
            maxLength={500}
            name="bio"
            placeholder="A few words about you, what you're into, or what you're helping to find here."
          />

          <p className="mt-2 text-xs text-white/40">
            Optional · Maximum 500 characters
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white">
            Make It More Yours Later
          </p>

          <p className="mt-2 text-sm leading-6 text-white/45">
            After You&apos;re in, you&apos;ll be able to add a profile photo,
            cover image, and more to make your SIGNAL profile feel like you.
          </p>
        </div>
      </section>

      <section
        data-step="1"
        aria-labelledby="location-step"
        className={currentStep === 1 ? "space-y-7" : "hidden"}
      >
        <h3 className="sr-only" id="location-step">
          Your location and privacy
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            autoComplete="address-level2"
            error={firstFieldError(state, "city")}
            label="City"
            name="city"
            placeholder="Newark"
            required
          />

          <SelectField
            defaultValue=""
            id="region"
            label="State"
            name="region"
            required
          >
            <option disabled value="">
              Select your state
            </option>
            <option value="Alabama">Alabama</option>
            <option value="Alaska">Alaska</option>
            <option value="Arizona">Arizona</option>
            <option value="Arkansas">Arkansas</option>
            <option value="California">California</option>
            <option value="Colorado">Colorado</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Delaware">Delaware</option>
            <option value="Florida">Florida</option>
            <option value="Georgia">Georgia</option>
            <option value="Hawaii">Hawaii</option>
            <option value="Idaho">Idaho</option>
            <option value="Illinois">Illinois</option>
            <option value="Indiana">Indiana</option>
            <option value="Iowa">Iowa</option>
            <option value="Kansas">Kansas</option>
            <option value="Kentucky">Kentucky</option>
            <option value="Louisiana">Louisiana</option>
            <option value="Maine">Maine</option>
            <option value="Maryland">Maryland</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Michigan">Michigan</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Mississippi">Mississippi</option>
            <option value="Missouri">Missouri</option>
            <option value="Montana">Montana</option>
            <option value="Nebraska">Nebraska</option>
            <option value="Nevada">Nevada</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="New Jersey">New Jersey</option>
            <option value="New Mexico">New Mexico</option>
            <option value="New York">New York</option>
            <option value="North Carolina">North Carolina</option>
            <option value="North Dakota">North Dakota</option>
            <option value="Ohio">Ohio</option>
            <option value="Oklahoma">Oklahoma</option>
            <option value="Oregon">Oregon</option>
            <option value="Pennsylvania">Pennsylvania</option>
            <option value="Rhode Island">Rhode Island</option>
            <option value="South Carolina">South Carolina</option>
            <option value="South Dakota">South Dakota</option>
            <option value="Tennessee">Tennessee</option>
            <option value="Texas">Texas</option>
            <option value="Utah">Utah</option>
            <option value="Vermont">Vermont</option>
            <option value="Virginia">Virginia</option>
            <option value="Washington">Washington</option>
            <option value="West Virginia">West Virginia</option>
            <option value="Wisconsin">Wisconsin</option>
            <option value="Wyoming">Wyoming</option>
            <option value="District of Columbia">District of Columbia</option>
          </SelectField>

          <TextField
            autoCapitalize="characters"
            autoComplete="country"
            error={firstFieldError(state, "countryCode")}
            hint="Use the two-letter country code, like US."
            label="Country"
            name="countryCode"
            placeholder="US"
            required
          />

          <SelectField
            defaultValue="hidden"
            hint="You choose how much of your general location other members can see. SIGNAL never asks for your home address."
            id="locationVisibility"
            label="Who can see where you’re based?"
            name="locationVisibility"
          >
            <option value="hidden">Keep it private</option>
            <option value="city_region">Show my city and region</option>
            <option value="region_only">Show only my region</option>
          </SelectField>
        </div>

        <SelectField
          defaultValue="friends"
          id="friendListVisibility"
          label="Who can see your connections?"
          name="friendListVisibility"
        >
          <option value="private">Only me</option>
          <option value="friends">My friends</option>
          <option value="members">SIGNAL members</option>
        </SelectField>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-5 has-checked:border-[#ca9aff]/70 has-checked:bg-[#6c14ce]/15">
          <input
            className="mt-0.5 size-5 shrink-0 accent-[#a855f7]"
            defaultChecked
            name="discoverable"
            type="checkbox"
          />

          <span>
            <span className="block text-sm font-semibold text-white">
              Help People Find Me
            </span>

            <span className="mt-1 block text-xs leading-5 text-white/45">
              SIGNAL can include your profile in relevant people and community
              recommendations based on your interests, skills, location, and
              connection preferences.
            </span>
          </span>
        </label>
      </section>

      <section
        data-step="2"
        aria-labelledby="interests-step"
        className={currentStep === 2 ? "space-y-7" : "hidden"}
      >
        <h3 className="sr-only" id="interests-step">
          Interests and skills
        </h3>

        <ChoiceGrid
          choices={interests}
          hint="Choose the things you genuinely enjoy, want to explore, care about, or want more of in your life."
          legend="Interests"
          name="interestIds"
        />

        <ChoiceGrid
          choices={skills}
          hint="Choose skills you already have, are developing, or would be happy to share with others."
          legend="What Are You Good At - or Growing Into?"
          name="skillIds"
        />
      </section>

      <section
        data-step="3"
        aria-labelledby="connections-step"
        className={currentStep === 3 ? "space-y-7" : "hidden"}
      >
        <h3 className="sr-only" id="connections-step">
          Connection preferences
        </h3>

        <fieldset>
          <legend className="text-xl font-bold text-white">
            Preferred Connection Types?
          </legend>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Choose what feels right for you. These preferences help shape your
            recommendations, and you can change them anytime.
          </p>

          <div className="mt-5">
            <PreferenceGrid choices={connectionChoices} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xl font-bold text-white">
            How Should People Find and Invite You?
          </legend>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Choose how SIGNAL and other members can include you in
            recommendations, invitations, and new connections.
          </p>

          <div className="mt-5">
            <PreferenceGrid choices={recommendationChoices} />
          </div>
        </fieldset>
      </section>

      <section
        data-step="4"
        aria-labelledby="accessibility-step"
        className={currentStep === 4 ? "space-y-7" : "hidden"}
      >
        <h3 className="sr-only" id="accessibility-step">
          Accessibility Preferences
        </h3>

        <div className="rounded-2xl border border-[#ca9aff]/20 bg-[#6c14ce]/10 p-5">
          <p className="text-sm font-semibold text-white">
            This section is optional and private.
          </p>

          <p className="mt-2 text-sm leading-6 text-white/50">
            Choose any features that make it easier or more comfortable for you
            to participate. You do not need to explain why, and these
            preferences will not appear on your public profile.
          </p>
        </div>

        <PreferenceGrid choices={accessibilityChoices} />

        <div>
          <label
            className="mb-2 block text-sm font-bold text-white/85"
            htmlFor="accessibilityNotes"
          >
            Anything else that would help?
          </label>

          <textarea
            className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white transition outline-none placeholder:text-white/25 hover:border-white/20 focus:border-[#ca9aff]"
            id="accessibilityNotes"
            maxLength={500}
            name="accessibilityNotes"
            placeholder="Optional private access notes"
          />

          <p className="mt-2 text-xs leading-5 text-white/40">
            Keep this focused on practical access needs. Do not include medical
            diagnoses or sensitive health information.
          </p>
        </div>
      </section>

      <section
        data-step="5"
        aria-labelledby="review-step"
        className={currentStep === 5 ? "space-y-7" : "hidden"}
      >
        <h3 className="sr-only" id="confirmation-step">
          Final confirmation
        </h3>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="text-lg font-bold text-white"></p>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            You won’t be starting alone.
          </p>

          <p className="mt-2 text-sm leading-6 text-white/45">
            You’ll begin with a welcome connection from the SIGNAL community to
            help you get oriented. You’ll always be able to manage or remove
            that connection.
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="min-h-12 rounded-full border border-white/15 px-6 text-sm font-bold text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          disabled={isFirstStep}
          onClick={goBack}
          type="button"
        >
          Back
        </button>

        {isFinalStep ? (
          <SubmitButton
            className="border-transparent bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
            pendingLabel="Creating your SIGNAL profile…"
          >
            Enter SIGNAL
          </SubmitButton>
        ) : (
          <button
            className="min-h-12 rounded-full bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] px-7 text-sm font-black text-white shadow-lg shadow-[#6c14ce]/20 transition hover:brightness-110"
            onClick={goForward}
            type="button"
          >
            Continue
          </button>
        )}
      </div>
    </form>
  );
}
