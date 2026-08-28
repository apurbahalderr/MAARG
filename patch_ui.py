import re

with open("app/app/government/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_button = """                                  <button
                                    type="button"
                                    disabled={selectingIdx !== null}
                                    onClick={async () => {"""

new_button = """                                  <button
                                    type="button"
                                    disabled={selectingIdx !== null || r.riskScore === 100}
                                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${selectingIdx === i ? 'bg-primary text-white' : r.riskScore === 100 ? 'bg-danger-bg text-danger cursor-not-allowed opacity-70' : 'bg-surface text-primary border border-line hover:bg-wash'}`}
                                    onClick={async () => {"""

code = code.replace(old_button, new_button)

# Also let's update the button text to show UNSAFE if riskScore === 100
old_button_text = """{selectingIdx === i ? "Saving..." : "Select"}"""
if old_button_text not in code:
    # try finding just "Select"
    old_button_text = """{selectingIdx === i ? "Saving?" : "Select"}"""
    
new_button_text = """{selectingIdx === i ? "Saving..." : r.riskScore === 100 ? "UNSAFE" : "Select"}"""

code = code.replace(old_button_text, new_button_text)
code = code.replace("""{selectingIdx === i ? "Saving?" : "Select"}""", new_button_text)

# wait, I need to remove the existing className from the button if it existed.
# Let's check what the existing button actually looks like.
