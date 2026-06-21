import type { ExerciseGuide } from '../types';


export const EXERCISE_CATALOG: Record<string, ExerciseGuide> = {
  "bench-press": {
    name: "Bench Press",
    muscleGroup: "Chest, Anterior Deltoids, Triceps",
    category: "upper",
    instructions: [
      "Lie flat on the bench with your feet planted firmly on the floor.",
      "Grip the bar with hands slightly wider than shoulder-width apart.",
      "Unrack the bar and position it directly over your chest with arms fully extended.",
      "Inhale and lower the bar slowly to your mid-chest level (around the nipples).",
      "Push the bar back up explosively while exhaling, keeping your elbows tucked at roughly 45 degrees."
    ],
    mistakes: [
      "Flaring the elbows out at 90 degrees, which places extreme stress on the rotator cuffs.",
      "Bouncing the barbell off the chest to gain momentum.",
      "Lifting the hips or feet off the bench/ground during the lift."
    ],
    tips: [
      "Squeeze your shoulder blades together and keep them pinned to the bench throughout.",
      "Drive your feet into the floor to create total-body tension (leg drive).",
      "Think about bending the bar in half to engage your lats and stabilize your shoulders."
    ]
  },
  "incline-dumbbell-press": {
    name: "Incline Dumbbell Press",
    muscleGroup: "Upper Chest, Anterior Deltoids, Triceps",
    category: "upper",
    instructions: [
      "Set an incline bench to roughly 30-45 degrees.",
      "Sit back with a dumbbell in each hand resting on your thighs.",
      "Lie back and press the dumbbells up to arm's length over your chest.",
      "Lower the dumbbells slowly to the sides of your upper chest, keeping your forearms vertical.",
      "Press the weights back up to the starting position in a slight arc."
    ],
    mistakes: [
      "Setting the incline angle too high (above 45 degrees), which shifts the load entirely to front shoulders.",
      "Allowing the dumbbells to touch or bang together at the top (loss of tension).",
      "Allowing the forearms to flare outwards or tilt inwards."
    ],
    tips: [
      "Keep a arch in your upper chest, similar to flat benching.",
      "Control the dumbbells on the descent—aim for a 2 to 3-second negative phase.",
      "Keep your wrists stacked directly over your elbows."
    ]
  },
  "shoulder-press": {
    name: "Shoulder Press",
    muscleGroup: "Anterior & Lateral Deltoids, Triceps, Core",
    category: "upper",
    instructions: [
      "Sit or stand tall with dumbbells or a barbell at shoulder height.",
      "Keep your core braced, glutes squeezed, and elbows slightly forward of your body.",
      "Press the weights straight overhead until your arms are fully locked out.",
      "Carefully lower the weights back down under control to shoulder level."
    ],
    mistakes: [
      "Arching the lower back excessively to press the weight (bracing failure).",
      "Not locking out the elbows at the top, shortening the range of motion.",
      "Pushing the weight forward instead of straight up."
    ],
    tips: [
      "Brace your abs as if you are about to be punched before starting the press.",
      "At the top of the lift, push your head slightly forward ('look through the window') to align the spine.",
      "If standing, keep a slight bend in your knees for balance."
    ]
  },
  "lateral-raises": {
    name: "Lateral Raises",
    muscleGroup: "Lateral Deltoids (Side Shoulders)",
    category: "upper",
    instructions: [
      "Stand with feet shoulder-width apart, dumbbells at your sides, palms facing inward.",
      "Slightly hinge forward and keep a micro-bend in your elbows.",
      "Raise the weights out to the sides in a wide arc until your arms are parallel to the floor.",
      "Slowly lower the dumbbells back to the starting position."
    ],
    mistakes: [
      "Using excessive body momentum (swinging) to lift the weights.",
      "Leading the movement with the wrists rather than the elbows.",
      "Raising the weights too high above shoulder height (engages traps instead)."
    ],
    tips: [
      "Imagine pouring out two jugs of water at the top of the movement (tilt pinkies slightly up).",
      "Lead with your elbows and reach out, not just up, to maximize lateral delt loading.",
      "Perform these slowly, focusing entirely on the contraction."
    ]
  },
  "tricep-pushdown": {
    name: "Tricep Pushdown",
    muscleGroup: "Triceps Brachii",
    category: "upper",
    instructions: [
      "Stand facing a cable pulley machine with a rope or bar attachment at chest height.",
      "Grip the attachment and tuck your elbows firmly against your ribs.",
      "Push the rope/bar straight down until your arms are fully extended and lock your elbows.",
      "Slowly return the attachment to the starting position, maintaining elbow position."
    ],
    mistakes: [
      "Allowing the elbows to flare out and move forward/backward (using shoulders/lats).",
      "Leaning your body weight on top of the handle to push it down.",
      "Short-changing the range of motion by not locking out."
    ],
    tips: [
      "Keep your shoulder blades pulled down and back.",
      "If using a rope, flare the ends of the rope outwards at the bottom of the movement.",
      "Squeeze your triceps for a full second at the bottom of each rep."
    ]
  },
  "lat-pulldown": {
    name: "Lat Pulldown",
    muscleGroup: "Latissimus Dorsi, Biceps, Brachialis",
    category: "upper",
    instructions: [
      "Adjust the thigh pad on the machine and grip the pulldown bar wider than shoulder-width.",
      "Sit down, anchoring your thighs under the pads.",
      "Pull the bar down toward your upper chest, driving your elbows down and backward.",
      "Squeeze your lats at the bottom, then slowly return the bar back up to full stretch."
    ],
    mistakes: [
      "Pulling the bar down behind the neck (dangerous for shoulder joints).",
      "Leaning back excessively and swinging the torso to move the weight.",
      "Pulling the bar down with your arms instead of engaging the back."
    ],
    tips: [
      "Focus on driving your elbows down toward your back pockets.",
      "Maintain a proud chest (lean back slightly, around 10-15 degrees) and touch the bar to your upper chest.",
      "Use a thumbless grip (suicide grip) to minimize forearm fatigue."
    ]
  },
  "seated-cable-row": {
    name: "Seated Cable Row",
    muscleGroup: "Rhomboids, Lats, Trapezius, Biceps",
    category: "upper",
    instructions: [
      "Sit at a cable row station with your feet on the platforms and knees slightly bent.",
      "Grip the handle, sit upright with your shoulders back and chest up.",
      "Pull the handle towards your lower abdomen, drawing your shoulder blades together.",
      "Extend your arms fully, letting your back stretch slightly without bending forward at the waist."
    ],
    mistakes: [
      "Rounding the lower back during the stretch phase.",
      "Yanking the weight back using lower-back momentum.",
      "Shrugging the shoulders up toward the ears."
    ],
    tips: [
      "Imagine squeezing a pencil between your shoulder blades at the peak of the row.",
      "Keep your elbows tucked close to your ribs as you pull.",
      "Keep your torso vertical throughout the entire motion."
    ]
  },
  "face-pull": {
    name: "Face Pull",
    muscleGroup: "Rear Deltoids, Rotator Cuffs, Upper Back",
    category: "upper",
    instructions: [
      "Set a cable pulley to upper chest height with a rope attachment.",
      "Step back to lift the weight stack, holding the rope with thumbs pointing backward.",
      "Pull the center of the rope directly toward your nose/forehead.",
      "Simultaneously pull the ends of the rope apart, rotating your hands outward to complete a 'double biceps' pose."
    ],
    mistakes: [
      "Pulling the rope down toward the chest or neck (not engaging rear delts).",
      "Using too much weight, causing rapid jerking.",
      "Failing to rotate the shoulders externally."
    ],
    tips: [
      "Keep the movement slow and controlled; focus on high-rep endurance.",
      "At the finish position, your wrists should be higher than your elbows.",
      "Hold the contraction for a full second to build rotator cuff strength."
    ]
  },
  "dumbbell-curl": {
    name: "Dumbbell Curl",
    muscleGroup: "Biceps Brachii, Brachialis",
    category: "upper",
    instructions: [
      "Stand tall with a dumbbell in each hand, palms facing forward or inward.",
      "Keep elbows pinned to your sides, curl the weights up toward your shoulders.",
      "Rotate your palms to face up at the top if starting with a neutral grip.",
      "Lower the weights slowly to full extension."
    ],
    mistakes: [
      "Swinging the elbows forward to lift the weights (uses front delts).",
      "Using back swing to hoist heavy weights.",
      "Not straightening the arm completely at the bottom."
    ],
    tips: [
      "Squeeze your biceps hard at the peak of the curl.",
      "Keep your wrists straight; do not curl the wrists in to assist.",
      "Perform the negative phase (lowering) twice as slow as the positive phase."
    ]
  },
  "hammer-curl": {
    name: "Hammer Curl",
    muscleGroup: "Brachioradialis (Forearms), Brachialis, Biceps",
    category: "upper",
    instructions: [
      "Stand with dumbbells at your sides, palms facing each other (neutral grip).",
      "Keeping elbows stationary, curl the dumbbells up toward your shoulders.",
      "Ensure palms continue facing each other throughout the lift.",
      "Lower the weights under control."
    ],
    mistakes: [
      "Elbows drifting forward during the lift.",
      "Allowing the wrist to flop or bend under load."
    ],
    tips: [
      "This is excellent for building forearm and outer bicep thickness.",
      "Keep your grip firm on the dumbbells."
    ]
  },
  "squat": {
    name: "Squat",
    muscleGroup: "Quadriceps, Glutes, Hamstrings, Core",
    category: "lower",
    instructions: [
      "Rest the barbell on your upper traps. Stand with feet shoulder-width apart, toes pointed slightly out.",
      "Brace your core, inhale, and push your hips back and down to squat.",
      "Descend until your hips are below parallel with your knees (deep squat).",
      "Drive back up to the starting position, pushing through your heels and exhaling at the top."
    ],
    mistakes: [
      "Allowing the knees to cave inward (valgus collapse), putting strain on the ACL.",
      "Rounding the lower back ('butt wink') at the bottom of the lift.",
      "Lifting heels off the ground, shifting weight to the toes."
    ],
    tips: [
      "Pretend you are trying to spread the floor apart with your feet to engage your glutes.",
      "Keep your chest upright and look straight ahead or slightly down.",
      "Keep your weight evenly distributed across the mid-foot."
    ]
  },
  "romanian-deadlift": {
    name: "Romanian Deadlift (RDL)",
    muscleGroup: "Hamstrings, Gluteus Maximus, Lower Back",
    category: "lower",
    instructions: [
      "Stand with feet hip-width apart, holding a barbell/dumbbells in front of your thighs.",
      "Softly bend your knees (10-15 degrees) and lock them in that position.",
      "Hinge at the hips, pushing your butt backward while sliding the weight down your legs.",
      "Lower until you feel a deep stretch in your hamstrings, keeping your back perfectly flat.",
      "Drive your hips forward and squeeze your glutes to stand back up."
    ],
    mistakes: [
      "Rounding the spine, placing extreme load on the lumbar discs.",
      "Allowing the bar to drift away from the legs (increases lower back leverage).",
      "Bending the knees too much, which converts the RDL into a standard squat."
    ],
    tips: [
      "Think of the movement as moving your hips horizontally back and forth, not vertically up and down.",
      "Keep your head neutral; do not look up at a mirror, look down at the floor as you hinge.",
      "Engage your lats to keep the bar glued to your shins/thighs."
    ]
  },
  "leg-press": {
    name: "Leg Press",
    muscleGroup: "Quadriceps, Glutes, Hamstrings",
    category: "lower",
    instructions: [
      "Sit on the leg press machine and place your feet shoulder-width apart on the platform.",
      "Lower the safety locks and slowly bend your knees to lower the platform toward your chest.",
      "Lower until your knees are bent at roughly 90 degrees.",
      "Push the platform away by extending your legs, making sure not to lock out your knees."
    ],
    mistakes: [
      "Locking out the knees forcefully at the top (extremely dangerous).",
      "Allowing the lower back/tailbone to lift off the seat at the bottom.",
      "Using a range of motion that is too shallow."
    ],
    tips: [
      "Keep your heels flat against the platform; do not push with your toes.",
      "Grip the handles at the side of the seat to pull your hips down firmly into the pad.",
      "Varying foot width can target different areas (higher = glutes/hamstrings, lower = quads)."
    ]
  },
  "leg-curl": {
    name: "Leg Curl",
    muscleGroup: "Hamstrings (Biceps Femoris)",
    category: "lower",
    instructions: [
      "Lie down (or sit) in the leg curl machine, securing the roller pad just below your calves.",
      "Grip the handles and pull your heels towards your glutes as far as possible.",
      "Hold the squeeze at the peak contraction for a split second.",
      "Slowly return your legs to the fully extended position."
    ],
    mistakes: [
      "Lifting your hips off the pad (on lying leg curls) to pull the weight.",
      "Allowing the weight stack to slam down at the end of each rep."
    ],
    tips: [
      "Keep your ankles flexed (toes pulled toward shins) to isolate the hamstrings.",
      "Focus on a slow, controlled release (eccentric phase)."
    ]
  },
  "calf-raise": {
    name: "Calf Raise",
    muscleGroup: "Gastrocnemius, Soleus (Calves)",
    category: "lower",
    instructions: [
      "Position your toes on the edge of a block or calf machine, with heels hanging off.",
      "Lower your heels as far as possible to feel a deep stretch in the calf muscles.",
      "Push through the balls of your feet to raise your heels as high as possible.",
      "Hold the top contraction, then lower slowly."
    ],
    mistakes: [
      "Bouncing at the bottom of the movement (using Achilles tendon elastic energy).",
      "Not using a full range of motion (partial reps at the top/bottom)."
    ],
    tips: [
      "Hold the bottom stretch for 2 seconds to dissipate the tendon bounce before pushing up.",
      "Contract the calf hard at the top and pause for 1 second."
    ]
  }
};
