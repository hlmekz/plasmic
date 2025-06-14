<script lang="ts">
  // These are placeholder imports.
  // After running 'plasmic sync' with your actual project,
  // you will import the real components from e.g. '$lib/components/plasmic/YourComponent'
  // or the path configured in your plasmic.json (default: '../components/plasmic/...')

  // Hypothetical components - paths will need to be updated after plasmic sync
  // For Svelte projects, Plasmic typically generates components that can be imported.
  // Let's assume they will be in 'src/components/plasmic/'
  // and Svelte's $lib alias points to 'src/lib', so direct relative paths are better here.

  // import CustomButton from '../../components/plasmic/CustomButton.svelte';
  // import InfoCard from '../../components/plasmic/InfoCard.svelte';
  // import SimpleHeader from '../../components/plasmic/SimpleHeader.svelte';

  // Placeholder data for the InfoCard
  const card1Title = "SvelteKit Integration";
  const card1Description = "This card is a Plasmic component rendered in SvelteKit!";

  const card2Title = "Multiple Components";
  const card2Description = "Showing how to use several different Plasmic components on one page.";

  // In a real scenario, you would get these components after `plasmic sync`
  // For now, we'll use placeholders for the components themselves.
  // Remove these dummy components once real ones are synced.
  const CustomButton = ({children}: {children: any}) => ({ component: CustomButton, props: {children}});
  const InfoCard = (props: any) => ({ component: InfoCard, props });
  const SimpleHeader = () => ({ component: SimpleHeader, props: {} });

</script>

<div>
  <!-- <SimpleHeader /> -->
  <div style="border: 1px solid #eee; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
    <h2>Placeholder for SimpleHeader</h2>
  </div>

  <h1>Welcome to the Multi-Component SvelteKit + Plasmic Example!</h1>

  <p>
    This page demonstrates how you might import and use multiple components
    designed in Plasmic Studio within your SvelteKit application.
  </p>

  <section style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
    <h2>Info Cards Section</h2>
    <!-- <InfoCard title={card1Title} description={card1Description} /> -->
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 6px;">
      <h3>{card1Title} (Placeholder for InfoCard)</h3>
      <p>{card1Description}</p>
    </div>

    <!-- <InfoCard title={card2Title} description={card2Description}> -->
    <!--  <p>This card also includes children content passed from Svelte!</p> -->
    <!-- </InfoCard> -->
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 6px;">
      <h3>{card2Title} (Placeholder for InfoCard)</h3>
      <p>{card2Description}</p>
      <p style="margin-top: 10px; font-style: italic;">This card also includes children content passed from Svelte!</p>
    </div>
  </section>

  <section style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
    <h2>Button Section</h2>
    <!-- <CustomButton>Click Me!</CustomButton> -->
    <!-- <CustomButton color="primary">Primary Action</CustomButton> -->
    <button style="padding: 10px 15px; margin-right: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px;">
      Placeholder Button: Click Me!
    </button>
    <button style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px;">
      Placeholder Button: Primary Action
    </button>
  </section>

  <div style="margin-top: 40px; font-size: 0.9em; color: #555;">
    <p><strong>Note:</strong> The actual Plasmic components are commented out.</p>
    <ol>
      <li>Update <code>plasmic.json</code> with your real Project ID.</li>
      <li>Run <code>npm run plasmic:sync</code>.</li>
      <li>Uncomment the import statements above and the component usages below.</li>
      <li>Adjust import paths if your <code>plasmic.json</code> settings for <code>defaultPlasmicDir</code> are different. The default is <code>src/components/plasmic</code>.</li>
    </ol>
  </div>
</div>

<style>
  /* Add any page-specific styles here */
  section {
    margin-bottom: 2rem;
  }
  h1, h2 {
    color: #333;
  }
</style>
